// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test} from "forge-std/Test.sol";
import {FundMe} from "../../src/FundMe.sol";
import {MockAggregatorV3Interface} from "../mocks/MockAggregatorV3Interface.sol";

contract FundMeTest is Test {
    FundMe fundMe;
    MockAggregatorV3Interface mockPriceFeed;
    address USER = makeAddr("user");
    uint256 send_value = 0.1 ether; // 10e17
    uint256 startingBalance = 1000 ether;
    uint256 constant gasPrice = 1;

    function setUp() external {
        mockPriceFeed = new MockAggregatorV3Interface();
        fundMe = new FundMe(address(mockPriceFeed));
        vm.deal(USER, startingBalance);
    }

    function testMininmumDollarIsFive() public view {
        assertEq(fundMe.MINIMUM_USD(), 5 * 10 ** 18);
    }

    // Rest of the tests...
}

// filepath: test/mocks/MockAggregatorV3Interface.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract MockAggregatorV3Interface is AggregatorV3Interface {
    function decimals() external pure override returns (uint8) {
        return 18;
    }

    function description() external pure override returns (string memory) {
        return "Mock Aggregator";
    }

    function version() external pure override returns (uint256) {
        return 4;
    }

    function getRoundData(
        uint80
    )
        external
        pure
        override
        returns (uint80, int256, uint256, uint256, uint80)
    {
        return (0, 2000 * 10 ** 18, 0, 0, 0);
    }

    function latestRoundData()
        external
        pure
        override
        returns (uint80, int256, uint256, uint256, uint80)
    {
        return (0, 2000 * 10 ** 18, 0, 0, 0);
    }
}
