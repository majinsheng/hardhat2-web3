import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys a contract named "SampleNFT" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deploySampleNFT: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("SampleNFT", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
};

export default deploySampleNFT;

deploySampleNFT.tags = ["SampleNFT"];
