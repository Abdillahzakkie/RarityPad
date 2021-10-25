require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("dotenv/config");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
	const accounts = await hre.ethers.getSigners();

	for (const account of accounts) {
		console.log(account.address);
	}
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
	networks: {
		hardhat: {},
		mainnet: {
			url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.alchemyApiKey}`,
			accounts: [process.env.PRIVATE_KEY],
		},
		rinkeby: {
			url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.alchemyApiKey}`,
			accounts: [process.env.PRIVATE_KEY],
		},
	},
	solidity: {
		compilers: [{ version: "0.8.9" }],
	},
	gasReporter: {
		currency: "USD",
		gasPrice: 100,
		coinmarketcap: process.env.coinmarketcap,
	},
};
