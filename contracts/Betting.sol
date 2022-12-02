// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./NewToken.sol";

contract Betting is Ownable {
  struct Better {
    address betterAddress;
    uint256 bet;
    uint256 choice; // 1 implies player bet btc > $20,000 and 0 implies btc <= $20,000
  }

  address private _owner;
  uint256 private _numPlayers;
  uint256 private _maxNumPlayers;
  uint256 private _betPool;
  uint256 private _betIncreasePool;
  // Map of betters
  mapping (uint256 => Better) private _betters;
  NewToken private _token;

  modifier checkBetters() {
    require(_numPlayers < _maxNumPlayers, "All betters deposited their funds already");
    _;
  }

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
  modifier checkNonZero(uint256 amount) {
    require(amount >= 1, "Please ensure that you bet at least 1 NewToken");
    _;
  }

  modifier checkAllBetters() {
    require(_numPlayers == _maxNumPlayers, "Betters have yet to deposit their NewToken funds");
    _;
  }

  // will be called when a new user starts the betting process

  constructor (NewToken token, uint256 maxNumPlayers) {
    _owner = payable(msg.sender);
    _token = token;
    _maxNumPlayers = maxNumPlayers;
  }

  /**
    Function addFunds transfers NewToken deposit for this betting game to owner
    All betters are forced to deposit the value of betSize initialised by the first user
    Each better can only bet once
   */
  function addFunds(uint256 choice) public checkBetters checkExisting(msg.sender) checkNonZero(msg.value) payable {
    if (choice == 1) {
      _betIncreasePool += msg.value;
      _betPool += msg.value;
    }
    else if (choice == 0) {
      _betPool += msg.value;
    }
    else {
      revert("Please ensure that you call addFunds with a choice value of either 1 or 0, where 1 implies higher than threshold and 0 implies lower");
    }

    _betters[_numPlayers].betterAddress = msg.sender;
    _betters[_numPlayers].bet = msg.value;
    _betters[_numPlayers].choice = choice;
    
    _numPlayers++;
  }

  /**
    Function disburseFunds will distribute the funds to the winners who bet correctly
    Only the owner of the contract can call this function
   */

  function disburseFunds(uint256 choice) public onlyOwner checkAllBetters {
    uint256 sumCorrectBet;
    if (choice == 1) {
      sumCorrectBet = _betIncreasePool;
    }
    else if (choice == 0) {
      sumCorrectBet = SafeMath.sub(_betPool, _betIncreasePool);
    }
    else {
      revert("Please ensure that you call disburseFunds with either 0 or 1, where 1 implies higher than threshold and 0 implies lower.");
    }

    /**
      Multiplication by 1000 is done so that in case of values like 1.5659 for _betPool/sumCorrectBet, we have a closer approximation
      i.e. it is scaled to 1565, multiplied by the amount bet by the better,
      and then scaled down by 1000, resulting in a closer approximation compared to working with 1 or 15 or 156
     */

    uint256 weight = SafeMath.div(SafeMath.mul(_betPool, 1000), sumCorrectBet);
    for (uint256 i = 0; i < _maxNumPlayers; i++) {
      if (_betters[i].choice == choice) {
        _token.transferFrom(_owner, _betters[i].betterAddress, SafeMath.div(SafeMath.mul(_betters[i].bet, weight), 1000));
      }
      _betters[i].betterAddress = address(0);
    }
    _numPlayers = 0;
    _betIncreasePool = 0;
    _betPool = 0;
  }

  
}