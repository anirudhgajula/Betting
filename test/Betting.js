const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Testing Contract with 20 Persons", function() {
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
        const token = await Token.deploy();
        const Betting = await ethers.getContractFactory("Betting");
        // ensure 1 million betSize in betting contract with 20 betters
        const betting = await Betting.connect(owner).deploy(token.address, ethers.utils.parseUnits('1', '24'), 20);
        return { owner, betters, token, betting };
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
            await betting.connect(betters[0]).addFunds(1);
            expect (await token.balanceOf(betters[0].address)).to.equal(0);
        });
        it("Should check one cannot bet more than once", async function() {
            const { betters, token, betting } = await loadFixture(deployFixture);
            await token.mint(betters[0].address, ethers.utils.parseUnits('2', '24'));
            await token.connect(betters[0]).approve(betting.address, ethers.utils.parseUnits('2', '24'));
            await betting.connect(betters[0]).addFunds(1);
            await expect(betting.connect(betters[0]).addFunds(1)).to.be.revertedWith("Better has placed a bet previously");
        });
    });

    describe("Betting Process Ending", function() {
        it("Should end the process successfully", async function() {
            const { owner, betters, token, betting } = await loadFixture(deployFixture);
            for (let i = 0; i < 20; i++) {
                await token.mint(betters[i].address, ethers.utils.parseUnits('1', '24'));
                await token.connect(betters[i]).approve(betting.address, ethers.utils.parseUnits('1', '24'));
                if (i % 2 == 1) {
                    await betting.connect(betters[i]).addFunds(1);
                }
                else {
                    await betting.connect(betters[i]).addFunds(0);
                }
            }
            await token.approve(betting.address, ethers.utils.parseUnits('20', '24'));
            await betting.disburseFunds(0);
            for (let i = 0; i < 20; i++) {
                if (i % 2 == 0) {
                    expect(await token.balanceOf(betters[i].address)).to.equal(ethers.utils.parseUnits('2', '24'));
                }
                else {
                    expect(await token.balanceOf(betters[i].address)).to.equal(0);
                }
            }
        });
    });
})