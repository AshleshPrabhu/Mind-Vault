// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/MindsFoundation.sol";

contract DeployMindsFoundation is Script {
    function run() external returns(MindsFoundation) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        MindsFoundation foundation = new MindsFoundation();
        
        vm.stopBroadcast();
        
        console.log("MindsFoundation deployed to:", address(foundation));
        console.log("Owner:", foundation.owner());
        return foundation;
    }
}