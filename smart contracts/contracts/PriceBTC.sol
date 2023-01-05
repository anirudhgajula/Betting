// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;
/* Retrieved From: 
Repository: https://github.com/smartcontractkit/chainlink/blob/develop/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol
Documentation: https://docs.chain.link/data-feeds/price-feeds/api-reference#latestrounddata
0xA394 is BTC / USD chainlink node on Goerli
*/

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract PriceBTC {
    AggregatorV3Interface internal priceFeed = AggregatorV3Interface(0xA39434A63A52E749F02807ae27335515BA4b07F7);
    function getLatestPrice() public view returns (int) {
        (,int price,,,) = priceFeed.latestRoundData();
        return price;
    }
}