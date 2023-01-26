// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";
import "./NewToken.sol";
import "./PriceBTC.sol";

contract Betting is Ownable, AutomationCompatibleInterface {
  struct Better {
    address betterAddress;
    uint256 bet;
    uint256 choice; // 2 implies no change. 1 implies player bet btc price increases by 0.5% and 0 implies btc price decreases by 0.5%.
  }

  address private _owner;
  uint256 private _numPlayers;
  uint256 private _betPool;
  uint256 private _betIncreasePool;
  uint256 private immutable _interval;
  uint256 private _lastTimeStamp;
  uint256 private _storedPrice;
  uint256 private _upperThresh;
  uint256 private _lowerThresh;
  // Map of betters
  mapping (uint256 => Better) private _betters;
  NewToken private _token;
  PriceBTC private _oracle;

  modifier checkExisting(address newvoter) {
    bool notBetted = true;
    for (uint256 i = 0; i < _numPlayers; i++) {
      if (_betters[i].betterAddress == newvoter) {
        notBetted = false;
      }
    }
    require(notBetted, "Better has placed a bet previously");
    _;
  }

  // will be called when a new user starts the betting process

  constructor (address token, address oracle, uint256 refreshInterval) {
    _owner = payable(msg.sender);
    _token = NewToken(token);
    _oracle = PriceBTC(oracle);
    _storedPrice = _oracle.getLatestPrice();
    _upperThresh = SafeMath.div(SafeMath.mul(SafeMath.div(_storedPrice, 10 ** 8), 1005), 1000);
    _lowerThresh = SafeMath.div(SafeMath.mul(SafeMath.div(_storedPrice, 10 ** 8), 995), 1000);
    _interval = refreshInterval;
    _lastTimeStamp = block.timestamp;
  }

  /**
    Function addFunds transfers NewToken deposit for this betting game to owner
    Each better can only bet once
   */
  function addFunds(uint256 value, uint256 choice) public payable checkExisting(msg.sender) {
    if (_token.balanceOf(msg.sender) < value) {
      revert("Please ensure that you have sufficient NewToken");
    }

    if (choice == 1) {
      _betIncreasePool += value;
      _betPool += value;
    }
    else if (choice == 0) {
      _betPool += value;
    }
    else {
      revert("Please ensure that you call addFunds with a choice value of either 1 or 0, where 1 implies higher than threshold and 0 implies lower");
    }
    
    _token.transferFrom(msg.sender, address(this), value);
    _betters[_numPlayers].betterAddress = msg.sender;
    _betters[_numPlayers].bet = value;
    _betters[_numPlayers].choice = choice;
    
    _numPlayers++;
  }

  function getTotalFunds() external view returns (uint256) {
    return _betPool;
  }
  
  function getUserBetChoice() external view returns (uint256, uint256) {
    for (uint i = 0; i < _numPlayers; i++) {
      if (msg.sender == _betters[i].betterAddress) {
        return (_betters[i].bet, _betters[i].choice);
      }
    }
    return (0, 0);
  }

  function getBetPrice() external view returns (uint256, uint256) {
    return (_lowerThresh, _upperThresh);
  }

  function getNumPlayers() external view returns (uint256) {
    return _numPlayers;
  }
  /**
    Function disburseFunds will distribute the funds to the winners who bet correctly
    Only the owner of the contract can call this function
   */

  function autodisburseFunds(uint256 choice) private {
    // If everyone bets increase, _betPool = _betIncreasePool. If price falls (choice = 0), no one gets anything.
    // Similarly, if everyone bets decrease, _betIncreasePool = 0 and no one gets anything.
    // Alternatively, if choice == 2, there is no significant change in latestPrice, so no one gets anything and all funds are returned back.
    if (choice == 2 || _numPlayers == 0 || _betPool == 0 || (_betPool == _betIncreasePool && choice == 0) || (_betIncreasePool == 0 && choice == 1)) {
      for (uint256 i = 0; i < _numPlayers; i++) {
        _token.transfer(_betters[i].betterAddress, _betters[i].bet);
        _betters[i].betterAddress = address(0);
      }
      _numPlayers = 0;
      _betIncreasePool = 0;
      _betPool = 0;
      return;
    }

    uint256 sumCorrectBet;
    if (choice == 1) {
      sumCorrectBet = _betIncreasePool;
    }
    else if (choice == 0) {
      sumCorrectBet = SafeMath.sub(_betPool, _betIncreasePool);
    }
    
    //  Multiplication by 1000 is done so that in case of values like 1.5659 for _betPool/sumCorrectBet, we have a closer approximation
    //  i.e. it is scaled to 1565, multiplied by the amount bet by the better,
    //  and then scaled down by 1000, resulting in a closer approximation compared to working with 1 or 15 or 156

    uint256 weight = SafeMath.div(SafeMath.mul(_betPool, 1000), sumCorrectBet);
    for (uint256 i = 0; i < _numPlayers; i++) {
      if (_betters[i].choice == choice) {
        _token.transfer(_betters[i].betterAddress, SafeMath.div(SafeMath.mul(_betters[i].bet, weight), 1000));
      }
      _betters[i].betterAddress = address(0);
    }
    _numPlayers = 0;
    _betIncreasePool = 0;
    _betPool = 0;
  }

  function disburseFunds(uint256 choice) public onlyOwner {
    uint256 sumCorrectBet;
    // If everyone bets increase, _betPool = _betIncreasePool. If price falls (choice = 0), no one gets anything.
    // Similarly, if everyone bets decrease, _betIncreasePool = 0 and no one gets anything.
    // Alternatively, if choice == 2, there is no significant change in latestPrice, so no one gets anything and all funds are returned back.

    if (choice == 2 || _numPlayers == 0 || _betPool == 0 || (_betPool == _betIncreasePool && choice == 0) || (_betIncreasePool == 0 && choice == 1)) {
      for (uint256 i = 0; i < _numPlayers; i++) {
        _token.transfer(_betters[i].betterAddress, _betters[i].bet);
        _betters[i].betterAddress = address(0);
      }
      _numPlayers = 0;
      _betIncreasePool = 0;
      _betPool = 0;
      return;
    }
    else if (choice == 1) {
      sumCorrectBet = _betIncreasePool;
    }
    else if (choice == 0) {
      sumCorrectBet = SafeMath.sub(_betPool, _betIncreasePool);
    }
    else {
      revert("Please ensure that you call disburseFunds with either 0, 1 or 2, where 2 implies no change, 1 implies higher and 0 implies lower.");
    }

    //  Multiplication by 1000 is done so that in case of values like 1.5659 for _betPool/sumCorrectBet, we have a closer approximation
    //  i.e. it is scaled to 1565, multiplied by the amount bet by the better,
    //  and then scaled down by 1000, resulting in a closer approximation compared to working with 1 or 15 or 156

    uint256 weight = SafeMath.div(SafeMath.mul(_betPool, 1000), sumCorrectBet);
    for (uint256 i = 0; i < _numPlayers; i++) {
      if (_betters[i].choice == choice) {
        _token.transfer(_betters[i].betterAddress, SafeMath.div(SafeMath.mul(_betters[i].bet, weight), 1000));
      }
      _betters[i].betterAddress = address(0);
    }
    _numPlayers = 0;
    _betIncreasePool = 0;
    _betPool = 0;
  }

  function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory performData) {
    upkeepNeeded = (block.timestamp - _lastTimeStamp) > _interval;
    performData = "";
  }

  function performUpkeep(bytes calldata) external override {
    if ((block.timestamp - _lastTimeStamp) > _interval ) {
      _lastTimeStamp = block.timestamp;
      _storedPrice = _oracle.getLatestPrice();
      uint256 choice = (SafeMath.div(_storedPrice, 10 ** 8) <= _lowerThresh) ? 0 :
                       (SafeMath.div(_storedPrice, 10 ** 8) >= _upperThresh) ? 1 :
                       2;
      autodisburseFunds(choice);
      _upperThresh = SafeMath.div(SafeMath.mul(SafeMath.div(_storedPrice, 10 ** 8), 1005), 1000);
      _lowerThresh = SafeMath.div(SafeMath.mul(SafeMath.div(_storedPrice, 10 ** 8), 995), 1000);
    }
  }
}