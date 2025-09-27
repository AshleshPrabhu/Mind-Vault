// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MitramFoundation {
    address public owner;
    constructor() {
        owner = msg.sender;
    }
    function donateToken(address token, uint256 amount) external {
        require(amount > 0, "Amount must be > 0");

        bool success = IERC20(token).transferFrom(msg.sender, address(this), amount);
        require(success, "Token transfer failed");
    }

    function getBalance(address token) public view returns (uint256 balance) {
        return IERC20(token).balanceOf(address(this));
    }

    function withdraw(address token) external {
        require(msg.sender == owner, "Only owner");

        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");

        bool success = IERC20(token).transfer(owner, balance);
        require(success, "Withdraw failed");
    }
}
