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
