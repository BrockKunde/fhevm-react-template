const hre = require("hardhat");

async function main() {
  console.log("Deploying Confidential Sports Betting Platform...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  try {
    const ConfidentialSportsBetting = await hre.ethers.getContractFactory("ConfidentialSportsBetting");
    const bettingContract = await ConfidentialSportsBetting.deploy();
    await bettingContract.waitForDeployment();

    const bettingAddress = await bettingContract.getAddress();
    console.log("ConfidentialSportsBetting deployed to:", bettingAddress);

    const BettingRewards = await hre.ethers.getContractFactory("BettingRewards");
    const rewardsContract = await BettingRewards.deploy(bettingAddress);
    await rewardsContract.waitForDeployment();

    const rewardsAddress = await rewardsContract.getAddress();
    console.log("BettingRewards deployed to:", rewardsAddress);

    console.log("\nDeployment completed successfully!");
    console.log("==========================================");
    console.log("ConfidentialSportsBetting:", bettingAddress);
    console.log("BettingRewards:", rewardsAddress);
    console.log("==========================================");

    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
      console.log("\nWaiting for block confirmations...");
      await bettingContract.deploymentTransaction().wait(6);

      try {
        console.log("Verifying contracts...");
        await hre.run("verify:verify", {
          address: bettingAddress,
          constructorArguments: [],
        });

        await hre.run("verify:verify", {
          address: rewardsAddress,
          constructorArguments: [bettingAddress],
        });
        console.log("Contracts verified successfully!");
      } catch (error) {
        console.log("Verification failed:", error.message);
      }
    }

  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });