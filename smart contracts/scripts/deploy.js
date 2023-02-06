const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    console.log("Account balance:", (await deployer.getBalance()).toString());
    const Token = await ethers.getContractFactory("NewToken");
    const token = await Token.deploy();
    console.log("Token address:", token.address);

    const Oracle = await ethers.getContractFactory("PriceBTC");
    // 0xA39434A63A52E749F02807ae27335515BA4b07F7 is ChainLink BTC / USD price feed address on Goerli
    const oracle = await Oracle.deploy("0xA39434A63A52E749F02807ae27335515BA4b07F7");
    console.log("Oracle address:", oracle.address);

    const Betting = await ethers.getContractFactory("Betting");
    // 3600 as we choose to have a contract disburses funds every hour (3600s)
    const betting = await Betting.deploy(token.address, oracle.address, 3600);
    await betting.deployed();

    console.log("Betting address:", betting.address);
}
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });