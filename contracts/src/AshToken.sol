// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";


contract AshToken is ERC20,Ownable{

    constructor(string memory _name,string memory _symbol) ERC20(_name,_symbol) Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    function mint(address _to, uint _amount) public onlyOwner{
         _mint(_to, _amount * 10 ** decimals());
    }
}