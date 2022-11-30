/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomiclabs/hardhat-ethers");
const INFURA_API_KEY = "37f53206c437468bb72832106c7b10ac";
const SEPOLIA_PRIVATE_KEY = "f25e7c14b2eb31f659141f092da1a0ec8aeec94d4e44614783f8175a8c5f78b3";


module.exports = {
  solidity: "0.8.17",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY]
    }
  }
};