// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "./NewToken.sol";

contract Betting is Ownable {
  struct Better {
    address betterAddress;
    uint256 choice; // 1 implies player bet btc > $20,000 and 0 implies btc <= $20,000
  }

  address private _owner;
  uint256 private _betSize;
  uint256 private _numPlayers;
  uint256 private _maxNumPlayers;
  uint256 private _betIncrease;
  // Map of betters
  mapping (uint256 => Better) private _betters;
  NewToken private _token;

  // will be called when a new user starts the betting process

  constructor (NewToken token, uint256 betSize, uint256 maxNumPlayers) {
    _owner = payable(msg.sender);
    _token = token;
    _betSize = betSize;
    _maxNumPlayers = maxNumPlayers;
  }

  /**
    Function addFunds transfers NewToken deposit for this betting game to owner
    All betters are forced to deposit the value of betSize initialised by the first user
    Each better can only bet once
   */
  function addFunds(uint256 choice) public checkChoice(choice) checkBetters checkExisting(msg.sender) checkTransfer {
    if (choice == 1) {
      _betIncrease++;
    }
    _betters[_numPlayers].betterAddress = msg.sender;
    _betters[_numPlayers].choice = choice;
    
    _numPlayers++;
  }

  /**
    Function disburseFunds will distribute the funds to the winners who bet correctly
    Only the owner of the contract can call this function
   */

  function disburseFunds(uint256 choice) public onlyOwner checkAllBetters {
    uint256 totalFunds = _betSize * _maxNumPlayers;
    uint counter;
    if (choice == 1) {
      counter = _betIncrease;
    }
    else {
      counter = _maxNumPlayers - _betIncrease;
    }
    /* OpenZeppelin SafeMath module for division not used as validation
       of integer underflow/overflow is done on language level for Solidity >= 0.8.0 */
    uint256 disburse = totalFunds / counter;
    for (uint256 i = 0; i < _maxNumPlayers; i++) {
      if (_betters[i].choice == choice) {
        _token.transferFrom(_owner, _betters[i].betterAddress, disburse);
      }
      _betters[i].betterAddress = address(0);
    }
    _numPlayers = 0;
    _betIncrease = 0;
  }

  // best to use 0, 1 so that in future if more things need to be added on, we can go to 2, 3
  modifier checkChoice(uint256 choice) {
    require(choice == 1 || choice == 0);
    _;
  }

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

  modifier checkTransfer() {
    require(_token.transferFrom(msg.sender, _owner, _betSize), 
    string(abi.encodePacked("Please ensure that you have enough NewToken and deposit ", Strings.toString(_betSize), "NT")));
    _;
  }

  modifier checkAllBetters() {
    require(_numPlayers == _maxNumPlayers, "Players have yet to deposit their NewToken funds");
    _;
  }
}