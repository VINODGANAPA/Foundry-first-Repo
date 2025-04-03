//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {FundMe} from "src/FundMe.sol";
import {MockAggregatorV3Interface} from "../test/MockAggregatorV3Interface.sol";

contract DeployFundMe is Script {
    function run() external {
        vm.startBroadcast();

        // Deploy the mock price feed
        MockAggregatorV3Interface mockPriceFeed = new MockAggregatorV3Interface();

        // Deploy the FundMe contract with the mock price feed address
        new FundMe(address(mockPriceFeed));

        vm.stopBroadcast();
    }
}
