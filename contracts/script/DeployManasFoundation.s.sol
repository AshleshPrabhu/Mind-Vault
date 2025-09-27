// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/ManasFoundation.sol";

contract DeployManasFoundation is Script {
    function run() external returns(ManasFoundation) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        ManasFoundation foundation = new ManasFoundation();
        
        vm.stopBroadcast();
        
        console.log("ManasFoundation deployed to:", address(foundation));
        console.log("Owner:", foundation.owner());
        return foundation;
    }
}