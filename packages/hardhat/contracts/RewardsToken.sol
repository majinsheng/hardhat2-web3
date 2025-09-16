// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RewardsToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("RewardsToken", "ERT") {
        _mint(msg.sender, initialSupply);
    }

    // Mint needed
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}