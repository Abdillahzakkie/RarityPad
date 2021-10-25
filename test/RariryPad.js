const { ethers } = require("hardhat");
const { expect } = require("chai");

const toWei = (_amount) => ethers.utils.parseEther(_amount.toString());
const fromWei = (_amount) => ethers.utils.formatEther(_amount.toString());

describe("RarityPad", () => {
	let deployer, feeReceiver, user1, user2, user3;
	beforeEach(async () => {
		[deployer, feeReceiver, user1, user2, user3] = await ethers.getSigners();
		const RarityPad = await ethers.getContractFactory("RarityPad");
		this.rarp = await RarityPad.deploy(deployer.address);
	});

	describe("deployment", () => {
		it("should deploy contract properly", async () => {
			expect(this.rarp.address).not.null;
			expect(this.rarp.address).not.undefined;
		});

		it("should set contract name properly", async () => {
			expect(await this.rarp.name()).to.equal("RarityPad");
		});

		it("should set contract symbol properly", async () => {
			expect(await this.rarp.symbol()).to.equal("RARP");
		});

		it("should mint 100_000_000 token during deployment", async () => {
			expect(await this.rarp.balanceOf(deployer.address)).to.equal(
				toWei(100_000_000)
			);
		});

		it("should mint total supply to deployer's wallet", async () => {
			expect(await this.rarp.balanceOf(deployer.address)).to.equal(
				await this.rarp.totalSupply()
			);
		});

		it("should set FEE_AMOUNT properly", async () => {
			expect(await this.rarp.FEE_AMOUNT()).to.equal("10");
		});

		it("should set FEE_DIVISOR properly", async () => {
			expect(await this.rarp.FEE_DIVISOR()).to.equal("100");
		});

		it("should set FEE_RECEIVER properly", async () => {
			expect(await this.rarp.FEE_RECEIVER()).to.equal(deployer.address);
		});
	});

	describe("setFeeReceiver()", () => {
		it("should update feeReceiver properly", async () => {
			await this.rarp.setFeeReceiver(feeReceiver.address);

			expect(await this.rarp.FEE_RECEIVER()).to.equal(feeReceiver.address);
		});

		it("should emit FeeReceiver event", async () => {
			await expect(this.rarp.setFeeReceiver(feeReceiver.address))
				.to.emit(this.rarp, "FeeReceiver")
				.withArgs(deployer.address, feeReceiver.address);
		});

		it("should reject if caller is not the owner", async () => {
			await expect(
				this.rarp.connect(user1).setFeeReceiver(feeReceiver.address)
			).to.revertedWith("Ownable: caller is not the owner");
		});
	});

	describe("setFee()", () => {
		it("should update fees properly", async () => {
			await this.rarp.setFee("5", "100");

			expect(await this.rarp.FEE_AMOUNT()).to.equal("5");
			expect(await this.rarp.FEE_DIVISOR()).to.equal("100");
		});

		it("should emit Fee event", async () => {
			await expect(this.rarp.setFee("5", "100"))
				.to.emit(this.rarp, "Fee")
				.withArgs("10", "100", "5", "100");
		});

		it("should reject if caller is not the owner", async () => {
			await expect(this.rarp.connect(user1).setFee("5", "100")).to.revertedWith(
				"Ownable: caller is not the owner"
			);
		});
	});

	describe("setExcluded()", () => {
		it("should exclude account properly", async () => {
			await this.rarp.setExcluded(feeReceiver.address, true);
			expect(await this.rarp.excluded(feeReceiver.address)).to.equal(true);
		});

		it("should emit Excluded event", async () => {
			await expect(this.rarp.setExcluded(feeReceiver.address, true))
				.to.emit(this.rarp, "Excluded")
				.withArgs(feeReceiver.address, true);
		});

		it("should reject if caller is not the owner", async () => {
			await expect(
				this.rarp.connect(user1).setExcluded(feeReceiver.address, true)
			).to.revertedWith("Ownable: caller is not the owner");
		});
	});

	describe("getTax()", () => {
		it("should calculate tax properly", async () => {
			const _amount = 100;
			const FEE_AMOUNT = parseInt(await this.rarp.FEE_AMOUNT());
			const FEE_DIVISOR = parseInt(await this.rarp.FEE_DIVISOR());
			const { _finalAmount, _taxAmount } = await this.rarp.getTax(
				toWei(_amount)
			);

			expect(parseInt(fromWei(_finalAmount))).to.equal(
				_amount - (_amount * FEE_AMOUNT) / FEE_DIVISOR
			);

			expect(parseInt(fromWei(_taxAmount))).to.equal(
				(_amount * FEE_AMOUNT) / FEE_DIVISOR
			);
		});
	});

	describe("transfer()", () => {
		beforeEach(async () => {
			await this.rarp.connect(deployer).setFeeReceiver(feeReceiver.address);
		});

		it("should transfer token between accounts", async () => {
			const _amount = 1000;
			const { _finalAmount, _taxAmount } = await this.rarp.getTax(
				toWei(_amount)
			);
			await expect(() =>
				this.rarp.connect(deployer).transfer(user1.address, toWei(_amount))
			).to.changeTokenBalances(
				this.rarp,
				[deployer, user1, feeReceiver],
				[toWei(-1000), _finalAmount, _taxAmount]
			);
		});

		it("should not charge tax on excluded", async () => {
			await expect(() =>
				this.rarp.connect(deployer).transfer(this.rarp.address, toWei(1000))
			).to.changeTokenBalances(
				this.rarp,
				[deployer, this.rarp, feeReceiver],
				[toWei(-1000), toWei(1000), toWei(0)]
			);
		});
	});
});
