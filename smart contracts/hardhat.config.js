/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomiclabs/hardhat-ethers");
require('dotenv').config({path:__dirname+'/../.env'});
const {INFURA_API_KEY, SEPOLIA_PRIVATE_KEY, GOERLI_API_KEY, GOERLI_PRIVATE_KEY} = process.env;

module.exports = {
  solidity: "0.8.0",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY]
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${GOERLI_API_KEY}`,
      accounts: [GOERLI_PRIVATE_KEY]
    }
  }
};