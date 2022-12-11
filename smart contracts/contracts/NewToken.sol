// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NewToken is ERC20, Ownable {
    constructor() ERC20("NewToken", "NT") {
        _mint(msg.sender, 10 ** 9 * 10 ** decimals());
    }
    function mint(address toMint, uint256 amount) public onlyOwner {
        _mint(toMint, amount);
    }
}