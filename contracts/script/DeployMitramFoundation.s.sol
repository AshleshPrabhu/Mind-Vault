// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/MitramFoundation.sol";

contract DeployMitramFoundation is Script {
    function run() external returns(MitramFoundation) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        MitramFoundation foundation = new MitramFoundation();
        
        vm.stopBroadcast();
        
        console.log("MitramFoundation deployed to:", address(foundation));
        console.log("Owner:", foundation.owner());
        return foundation;
    }
}