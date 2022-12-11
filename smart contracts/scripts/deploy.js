const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    console.log("Account balance:", (await deployer.getBalance()).toString());
  
    const Token = await ethers.getContractFactory("NewToken");
    const token = await Token.deploy();
    const Betting = await ethers.getContractFactory("Betting");
    const betting = await Betting.deploy(token.address, 20);
    await betting.deployed();

    console.log("Token address:", token.address);
    console.log("Betting address:", betting.address);
}
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });