const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require("hardhat");
const { expect } = require("chai");

// Interval for Chainlink Automation
const interval = 5;

describe("Testing Contract with 20 Persons - All Same Bet Size", function() {
    async function deployFixture() {
        const [owner] = await ethers.getSigners();
        const betters = [];
        for (let i = 0; i < 20; i++) {
            const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
            await owner.sendTransaction({
                to:wallet.address,
                value: ethers.utils.parseEther('1'),
            });
            betters.push(wallet);
        }
        const Token = await ethers.getContractFactory("NewToken");
        const DECIMALS = "8";
        const INITIAL_PRICE = "1750000000000"; /* Simulate 17500 as the price of BTC */
        const mockV3AggregatorFactory = await ethers.getContractFactory("MockV3Aggregator");
        const mockV3Aggregator = await mockV3AggregatorFactory.deploy(DECIMALS, INITIAL_PRICE);
        const Oracle = await ethers.getContractFactory("PriceBTC");
        const token = await Token.deploy();
        const oracle = await Oracle.deploy(mockV3Aggregator.address);
        const Betting = await ethers.getContractFactory("Betting");
        // ensure 1 million betSize in betting contract with 20 betters
        const betting = await Betting.connect(owner).deploy(token.address, oracle.address, interval);
        return { owner, betters, token, oracle, betting };
    };

    describe("Initialization Testing", function() {
        it("Should assign 1 billion tokens", async function () {
            const { token } = await loadFixture(deployFixture);
            expect(await token.totalSupply()).to.equal(ethers.utils.parseUnits('1', '27'));
        });

        it("Should initialise betting contract", async function() {
            const { owner, betting } = await loadFixture(deployFixture);
            expect(await betting.owner()).to.equal(owner.address);
        });
    });

    describe("Minting Funds", function() {
        it("Should mint funds to Player 0", async function() {
            const { betters, token } = await loadFixture(deployFixture);
            await token.mint(betters[0].address, ethers.utils.parseUnits('1', '24'));
            expect(await token.balanceOf(betters[0].address)).to.equal(ethers.utils.parseUnits('1', '24'));
        });
    });

    describe("Betting Process Testing", function() {
        it("Should deposit bet funds of Player 0", async function() {
            const { betters, token, betting } = await loadFixture(deployFixture);
            await token.mint(betters[0].address, ethers.utils.parseUnits('1', '24'));
            await token.connect(betters[0]).approve(betting.address, ethers.utils.parseUnits('1', '24'));
            await betting.connect(betters[0]).addFunds(ethers.utils.parseUnits('1', '24'), 1);
            expect (await token.balanceOf(betters[0].address)).to.equal(0);
        });
        it("Should return correct number of players", async function(){
            const { betters, token, betting } = await loadFixture(deployFixture);
            for (let i = 0; i < 5; i++) {
                await token.mint(betters[i].address, ethers.utils.parseUnits(String(1 + i), '24'));
                await token.connect(betters[i]).approve(betting.address, ethers.utils.parseUnits(String(1 + i), '24'));
                await betting.connect(betters[i]).addFunds(ethers.utils.parseUnits(String(1 + i), '24'), 1);
            }
            expect (await betting.connect(betters[4]).getNumPlayers()).to.equal(5);
        });
        it("Should return the correct betprice that has to be exceeded for BTC / USD price", async function() {
            const { betting } = await loadFixture(deployFixture);
            const betThresholds = await betting.getBetPrice();
            expect (betThresholds[0]).to.equal(17412);
            expect (betThresholds[1]).to.equal(17587);
        });
        
        it("Should return correct amount bet by each user and the total bet pool", async function() {
            const { betters, token, betting } = await loadFixture(deployFixture);
            for (let i = 0; i < 5; i++) {
                await token.mint(betters[i].address, ethers.utils.parseUnits(String(1 + i), '24'));
                await token.connect(betters[i]).approve(betting.address, ethers.utils.parseUnits(String(1 + i), '24'));
                await betting.connect(betters[i]).addFunds(ethers.utils.parseUnits(String(1 + i), '24'), 1);
            }
            for (let i = 0; i < 5; i++) {
                expect(await betting.connect(betters[i]).getUserBetChoice()).to.deep.equal([ethers.utils.parseUnits(String(1 + i), '24'), 1]);
            }
            expect(await betting.getTotalFunds()).to.equal(ethers.utils.parseUnits('15', '24'));
        });

        it("Should check one cannot bet more than once", async function() {
            const { betters, token, betting } = await loadFixture(deployFixture);
            await token.mint(betters[0].address, ethers.utils.parseUnits('2', '24'));
            await token.connect(betters[0]).approve(betting.address, ethers.utils.parseUnits('2', '24'));
            await betting.connect(betters[0]).addFunds(ethers.utils.parseUnits('1', '24'), 1);
            await expect(betting.connect(betters[0]).addFunds(ethers.utils.parseUnits('1', '24'), 1)).to.be.revertedWith("Better has placed a bet previously");
        });
    });

    describe("Chainlink Automation Testing", function() {
        it("Should not call perform upkeep as stipulated time yet to pass", async function() {
            const { betting } = await loadFixture(deployFixture);
            const checkData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(""));
            expect((await betting.callStatic.checkUpkeep(checkData))[0]).to.equal(false);
        });
        it("Should call perform upkeep once stipulated time passes", async function() {
            const { owner, betters, token, betting } = await loadFixture(deployFixture);
            const checkData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(""))
            for (let i = 0; i < 20; i++) {
                await token.mint(betters[i].address, ethers.utils.parseUnits('1', '24'));
                await token.connect(betters[i]).approve(betting.address, ethers.utils.parseUnits('1', '24'));
                if (i % 2 == 1) {
                    await betting.connect(betters[i]).addFunds(ethers.utils.parseUnits('1', '24'), 1);
                }
                else {
                    await betting.connect(betters[i]).addFunds(ethers.utils.parseUnits('1', '24'), 0);
                }
            }
            await time.increase(interval + 1);
            await betting.performUpkeep(checkData);
            for (let i = 0; i < 20; i++) {
                expect(await token.balanceOf(betters[i].address)).to.equal(ethers.utils.parseUnits('1', '24'));
            }
        });
    });

    describe("Betting Process Manual Ending", function() {
        it("Should end the process successfully by owner", async function() {
            const { owner, betters, token, betting } = await loadFixture(deployFixture);
            for (let i = 0; i < 20; i++) {
                await token.mint(betters[i].address, ethers.utils.parseUnits('1', '24'));
                await token.connect(betters[i]).approve(betting.address, ethers.utils.parseUnits('1', '24'));
                if (i % 2 == 1) {
                    await betting.connect(betters[i]).addFunds(ethers.utils.parseUnits('1', '24'), 1);
                }
                else {
                    await betting.connect(betters[i]).addFunds(ethers.utils.parseUnits('1', '24'), 0);
                }
            }
            await betting.disburseFunds(0);
            for (let i = 0; i < 20; i++) {
                if (i % 2 == 1) {
                    expect(await token.balanceOf(betters[i].address)).to.equal(ethers.utils.parseUnits('0', '24'));
                }
                else {
                    expect(await token.balanceOf(betters[i].address)).to.equal(ethers.utils.parseUnits('2', '24'));
                }
            }
        });
    });
})


describe("Testing Contract with 5 Persons - All Diff Bet Size", function() {
    async function deployFixture() {
        const [owner] = await ethers.getSigners();
        const betters = [];
        for (let i = 0; i < 20; i++) {
            const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
            await owner.sendTransaction({
                to:wallet.address,
                value: ethers.utils.parseEther('1'),
            });
            betters.push(wallet);
        }
        const Token = await ethers.getContractFactory("NewToken");
        const DECIMALS = "8";
        const INITIAL_PRICE = "1750000000000"; /* Simulate 17500 as the price of BTC */
        const mockV3AggregatorFactory = await ethers.getContractFactory("MockV3Aggregator");
        const mockV3Aggregator = await mockV3AggregatorFactory.deploy(DECIMALS, INITIAL_PRICE);
        const Oracle = await ethers.getContractFactory("PriceBTC");
        const token = await Token.deploy();
        const oracle = await Oracle.deploy(mockV3Aggregator.address);
        const Betting = await ethers.getContractFactory("Betting");
        // ensure 1 million betSize in betting contract with 20 betters
        const betting = await Betting.connect(owner).deploy(token.address, oracle.address, interval);
        return { owner, betters, token, oracle, betting };
    };

    describe("Initialization Testing", function() {
        it("Should assign 1 billion tokens", async function () {
            const { token } = await loadFixture(deployFixture);
            expect(await token.totalSupply()).to.equal(ethers.utils.parseUnits('1', '27'));
        });

        it("Should initialise betting contract", async function() {
            const { owner, betting } = await loadFixture(deployFixture);
            expect(await betting.owner()).to.equal(owner.address);
        });
    });

    describe("Betting Process with Different Bet Sizes", function() {
        it("Should automatically end the process successfully", async function() {
            const { owner, betters, token, betting } = await loadFixture(deployFixture);
            const checkData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(""));
            for (let i = 0; i < 5; i++) {
                await token.mint(betters[i].address, ethers.utils.parseUnits((i + 1).toString(), '24'));
                await token.connect(betters[i]).approve(betting.address, ethers.utils.parseUnits((i + 1).toString(), '24'));
                if (i % 2 == 1) {
                    await betting.connect(betters[i]).addFunds(ethers.utils.parseUnits((i + 1).toString(), '24'), 1);
                }
                else {
                    await betting.connect(betters[i]).addFunds(ethers.utils.parseUnits((i + 1).toString(), '24'), 0);
                }
            }
            await time.increase(interval + 1);
            await betting.performUpkeep(checkData);
            for (let i = 0; i < 5; i++) {
                expect(await token.balanceOf(betters[i].address)).to.equal(ethers.utils.parseUnits((i + 1).toString(), '24'));
            }
        });
    });
})