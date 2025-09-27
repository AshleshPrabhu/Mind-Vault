// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/AshToken.sol";

contract DeployAshToken is Script {
    function run() external returns(AshToken) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        AshToken token = new AshToken("Ash Token", "ASH");
        
        vm.stopBroadcast();
        
        console.log("AshToken deployed to:", address(token));
        console.log("Total Supply:", token.totalSupply());
        console.log("Decimals:", token.decimals());
        console.log("Owner:", token.owner());
        return token;
    }
}