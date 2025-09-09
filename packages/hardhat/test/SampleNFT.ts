import { ethers } from "hardhat";
import { expect } from "chai";
import { SampleNFT } from "../typechain-types";

describe("sampleNFT", function () {
  let sampleNFT: SampleNFT;
  const contractAddress = process.env.CONTRACT_ADDRESS;

  let contractArtifact: string;
  if (contractAddress) {
    contractArtifact = `contracts/download-${contractAddress}.sol:SampleNFT`;
  } else {
    contractArtifact = "contracts/SampleNFT.sol:SampleNFT";
  }

  it("Should deploy the contract", async function () {
    const contract = await ethers.getContractFactory(contractArtifact);
    sampleNFT = (await contract.deploy()) as SampleNFT;
  });

  describe("mintItem suit", function () {
    it("Should be able to mint an NFT", async function () {
      const [owner] = await ethers.getSigners();
      const startingBalance = await sampleNFT.balanceOf(owner.address);
      const mintResult = await sampleNFT.mintItem(
        owner.address,
        "QmfVMAmNM1kDEBYrC2TPzQDoCRFH6F5tE1e9Mr4FkkR5Xr"
      );
      const txResult = await mintResult.wait();
      expect(txResult?.status).to.equal(1);
      expect(await sampleNFT.balanceOf(owner.address)).to.equal(
        startingBalance + 1n
      );
    });

    it("Should track tokens of owner by index", async function () {
      const [owner] = await ethers.getSigners();
      const startingBalance = await sampleNFT.balanceOf(owner.address);
      const token = await sampleNFT.tokenOfOwnerByIndex(
        owner.address,
        startingBalance - 1n
      );
      expect(token).to.greaterThan(0);
    });
  });
});