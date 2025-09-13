import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

/**
 * 1.Deploys two ERC20 tokens "EmToken" as staking and rewards tokens.
 * 2.Deploys a contract named "StakingRewards" using the deployer account
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployStakingRewards: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const initialSupply = ethers.parseUnits('100', 'ether');
  const stakingToken = await deploy("EmToken", {
    from: deployer,
    args: ["Staking Token", "EST", initialSupply],
    log: true,
    autoMine: true,
  });

  const rewardsToken = await deploy("EmToken", {
    from: deployer,
    args: ["Rewards Token", "ERT", initialSupply],
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
