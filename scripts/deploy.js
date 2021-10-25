const hre = require("hardhat");

async function main() {
	const RarityPad = await hre.ethers.getContractFactory("RarityPad");
	const rarp = await RarityPad.deploy();
	await rarp.deployed();
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
