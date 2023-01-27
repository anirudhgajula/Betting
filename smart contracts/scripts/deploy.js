const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    console.log("Account balance:", (await deployer.getBalance()).toString());
    /*
    const Token = await ethers.getContractFactory("NewToken");
    const token = await Token.deploy();
    console.log("Token address:", token.address);

    const Oracle = await ethers.getContractFactory("PriceBTC");
    const oracle = await Oracle.deploy("0xA39434A63A52E749F02807ae27335515BA4b07F7");
    console.log("Oracle address:", oracle.address);
    */

    const Betting = await ethers.getContractFactory("Betting");
    const betting = await Betting.deploy("0xFd89292AC3B9EFD5F187F35C449B1374520E38f2", "0x523E95FD6d4901b2C6Ea0Cf69135b4098B369f97", 60);
    await betting.deployed();

    console.log("Betting address:", betting.address);
}
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });