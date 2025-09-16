import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

/**
 * 1.Deploys two ERC20 tokens "Token" as staking and rewards tokens.
 * 2.Deploys a contract named "StakingRewards" using the deployer account
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployStakingRewards: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const initialSupply = ethers.parseUnits("100", "ether");
  const stakingToken = await deploy("StakingToken", {
    from: deployer,
    args: [initialSupply],
    log: true,
    autoMine: true,
  });

  const rewardsToken = await deploy("RewardsToken", {
    from: deployer,
    args: [initialSupply],
    log: true,
    autoMine: true,
  });

  await deploy("StakingRewards", {
    from: deployer,
    args: [stakingToken.address, rewardsToken.address],
    log: true,
    autoMine: true,
  });
};

export default deployStakingRewards;

deployStakingRewards.tags = ["StakingRewards"];
