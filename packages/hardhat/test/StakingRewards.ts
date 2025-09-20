import { expect } from "chai";
import { ethers, network } from "hardhat";
import { StakingRewards, StakingToken, RewardsToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("StakingRewards Contract", function () {
  // Contracts
  let stakingToken: StakingToken;
  let rewardsToken: RewardsToken;
  let stakingRewards: StakingRewards;

  // Signers
  let owner: HardhatEthersSigner;
  let alice: HardhatEthersSigner;
  let bob: HardhatEthersSigner;
  let ownerAddress: string;
  let aliceAddress: string;
  let bobAddress: string;

  // Constants for testing
  const initialSupply = ethers.parseUnits("100", "ether");
  const stakingAmount = ethers.parseUnits("10", "ether");
  const smallerStakingAmount = ethers.parseUnits("5", "ether");
  const defaultDuration = 600; // 10 minutes in seconds
  const defaultRewardsRate = 6n * 10n ** 16n; // 0.06 tokens per second

  // Helper function for time manipulation
  async function increaseTime(seconds: number) {
    await network.provider.send("evm_increaseTime", [seconds]);
    await network.provider.send("evm_mine");
  }

  beforeEach(async function () {
    // Get signers
    [owner, alice, bob] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    aliceAddress = await alice.getAddress();
    bobAddress = await bob.getAddress();

    // Deploy tokens
    const StakingTokenFactory = await ethers.getContractFactory("StakingToken");
    stakingToken = (await StakingTokenFactory.deploy(initialSupply)) as StakingToken;

    const RewardsTokenFactory = await ethers.getContractFactory("RewardsToken");
    rewardsToken = (await RewardsTokenFactory.deploy(initialSupply)) as RewardsToken;

    // Deploy staking rewards contract
    const StakingRewardsFactory = await ethers.getContractFactory("StakingRewards");
    stakingRewards = (await StakingRewardsFactory.deploy(
      await stakingToken.getAddress(),
      await rewardsToken.getAddress()
    )) as StakingRewards;

    // Transfer tokens to users for testing
    await stakingToken.transfer(aliceAddress, stakingAmount);
    await stakingToken.transfer(bobAddress, stakingAmount);

    // Approve the staking contract to spend tokens
    await stakingToken.connect(alice).approve(await stakingRewards.getAddress(), stakingAmount);
    await stakingToken.connect(bob).approve(await stakingRewards.getAddress(), stakingAmount);
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await stakingRewards.owner()).to.equal(ownerAddress);
    });

    it("Should set the correct token addresses", async function () {
      expect(await stakingRewards.getStakingToken()).to.equal(await stakingToken.getAddress());
      expect(await stakingRewards.getRewardsToken()).to.equal(await rewardsToken.getAddress());
    });

    it("Should set the correct default duration and rewards rate", async function () {
      expect(await stakingRewards.duration()).to.equal(defaultDuration);
      expect(await stakingRewards.rewardsRate()).to.equal(defaultRewardsRate);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to set rewards duration", async function () {
      const newDuration = 1200; // 20 minutes
      await stakingRewards.setRewardsDuration(newDuration);
      expect(await stakingRewards.duration()).to.equal(newDuration);
    });

    it("Should not allow non-owner to set rewards duration", async function () {
      const newDuration = 1200; // 20 minutes
      await expect(
        stakingRewards.connect(alice).setRewardsDuration(newDuration)
      ).to.be.revertedWith("not owner");
    });

    it("Should revert if rewards duration is less than 10 minutes", async function () {
      const invalidDuration = 500; // Less than 10 minutes
      await expect(
        stakingRewards.setRewardsDuration(invalidDuration)
      ).to.be.revertedWith("reward duration should be more than 10 minutes");
    });

    it("Should allow owner to set rewards rate", async function () {
      const newRewardsRate = ethers.parseUnits("0.1", "ether"); // 0.1 tokens per second
      await stakingRewards.setRewardsRate(newRewardsRate);
      expect(await stakingRewards.rewardsRate()).to.equal(newRewardsRate);
    });

    it("Should not allow non-owner to set rewards rate", async function () {
      const newRewardsRate = ethers.parseUnits("0.1", "ether");
      await expect(
        stakingRewards.connect(alice).setRewardsRate(newRewardsRate)
      ).to.be.revertedWith("not owner");
    });

    it("Should revert if rewards rate is zero", async function () {
      await expect(stakingRewards.setRewardsRate(0)).to.be.revertedWith("rewards rate should be more than 0");
    });
  });

  describe("Staking", function () {
    it("Should allow users to stake tokens", async function () {
      await stakingRewards.connect(alice).stake(stakingAmount);

      expect(await stakingRewards.balanceOf(aliceAddress)).to.equal(stakingAmount);
      expect(await stakingRewards.totalSupply()).to.equal(stakingAmount);
      expect(await stakingToken.balanceOf(await stakingRewards.getAddress())).to.equal(stakingAmount);
    });

    it("Should emit EventForStake on successful stake", async function () {
      await expect(stakingRewards.connect(alice).stake(stakingAmount))
        .to.emit(stakingRewards, "EventForStake")
        .withArgs(aliceAddress, stakingAmount, await getBlockTimestamp(), defaultRewardsRate);
    });

    it("Should revert if staking zero amount", async function () {
      await expect(stakingRewards.connect(alice).stake(0)).to.be.revertedWith("amount = 0");
    });

    it("Should track multiple stakes from the same user", async function () {
      await stakingRewards.connect(alice).stake(smallerStakingAmount);
      
      // Move time forward to have different timestamps
      await increaseTime(60);
      
      await stakingRewards.connect(alice).stake(smallerStakingAmount);
      
      expect(await stakingRewards.balanceOf(aliceAddress)).to.equal(stakingAmount);
      expect(await stakingRewards.totalSupply()).to.equal(stakingAmount);
    });
  });

  describe("Withdrawing", function () {
    let stakeTimestamp: number;
    
    beforeEach(async function () {
      // Alice stakes tokens
      const tx = await stakingRewards.connect(alice).stake(stakingAmount);
      const receipt = await tx.wait();
      if (receipt && receipt.blockNumber) {
        const block = await ethers.provider.getBlock(receipt.blockNumber);
        stakeTimestamp = block ? block.timestamp : 0;
      }
    });
    
    it("Should allow users to withdraw their staked tokens", async function () {
      const withdrawAmount = ethers.parseUnits("5", "ether");
      
      await stakingRewards.connect(alice).withdraw(stakeTimestamp, withdrawAmount);
      
      expect(await stakingRewards.balanceOf(aliceAddress)).to.equal(stakingAmount - withdrawAmount);
      expect(await stakingRewards.totalSupply()).to.equal(stakingAmount - withdrawAmount);
      expect(await stakingToken.balanceOf(aliceAddress)).to.equal(withdrawAmount);
    });
    
    it("Should emit StakeWithdrawn on successful withdrawal", async function () {
      const withdrawAmount = ethers.parseUnits("5", "ether");
      
      await expect(stakingRewards.connect(alice).withdraw(stakeTimestamp, withdrawAmount))
        .to.emit(stakingRewards, "StakeWithdrawn")
        .withArgs(aliceAddress, withdrawAmount);
    });
    
    it("Should revert if withdrawing zero amount", async function () {
      await expect(stakingRewards.connect(alice).withdraw(stakeTimestamp, 0))
        .to.be.revertedWith("withdraw amount should be more than 0");
    });
    
    it("Should revert if withdrawing more than staked amount", async function () {
      const excessiveAmount = ethers.parseUnits("11", "ether");
      
      await expect(stakingRewards.connect(alice).withdraw(stakeTimestamp, excessiveAmount))
        .to.be.revertedWith("withdraw amount exceeds staked amount in this transaction");
    });
  });

  describe("Rewards", function () {
    let aliceStakeTimestamp: number;
    
    beforeEach(async function () {
      // Alice stakes tokens
      const tx = await stakingRewards.connect(alice).stake(stakingAmount);
      const receipt = await tx.wait();
      if (receipt && receipt.blockNumber) {
        const block = await ethers.provider.getBlock(receipt.blockNumber);
        aliceStakeTimestamp = block ? block.timestamp : 0;
      }
    });
    
    it("Should calculate earned rewards correctly during staking period", async function () {
      // Fast forward half the duration
      await increaseTime(defaultDuration / 2);
      
      // Calculate expected rewards (simplified calculation for testing)
      // For half duration, reward should be approximately 50% of max
      // Max reward = amount * rate / 1e18
      const expectedRewardsApprox = stakingAmount * defaultRewardsRate / 2n / 1n;
      
      const earned = await stakingRewards.earned(aliceAddress);
      
      // Allow for some variance due to block timestamps
      expect(earned).to.be.closeTo(expectedRewardsApprox, ethers.parseUnits("0.1", "ether"));
    });
    
    it("Should allow users to claim rewards after staking period", async function () {
      // Fast forward past the full duration
      await increaseTime(defaultDuration + 10);
      
      // Get initial balance
      const initialRewardsBalance = await rewardsToken.balanceOf(aliceAddress);
      
      // Claim rewards
      await stakingRewards.connect(alice).claimRewards();
      
      // Check that rewards were received
      const finalRewardsBalance = await rewardsToken.balanceOf(aliceAddress);
      expect(finalRewardsBalance).to.be.gt(initialRewardsBalance);
    });
    
    it("Should emit TotalRewards event when claiming rewards", async function () {
      // Fast forward past the full duration
      await increaseTime(defaultDuration + 10);
      
      // Get expected rewards
      const expectedRewards = await stakingRewards.earned(aliceAddress);
      
      // Claim rewards and check event
      await expect(stakingRewards.connect(alice).claimRewards())
        .to.emit(stakingRewards, "TotalRewards")
        .withArgs(aliceAddress, expectedRewards);
    });
    
    it("Should revert if no rewards to claim", async function () {
      // Bob hasn't staked anything yet
      await expect(stakingRewards.connect(bob).claimRewards())
        .to.be.revertedWith("no rewards to claim");
    });
    
    it("Should calculate rewards correctly for multiple staking transactions", async function () {
      // Bob stakes a portion
      await stakingRewards.connect(bob).stake(smallerStakingAmount);
      
      // Move time forward
      await increaseTime(defaultDuration / 4);
      
      // Bob stakes another portion
      await stakingRewards.connect(bob).stake(smallerStakingAmount);
      
      // Move time forward past duration
      await increaseTime(defaultDuration);
      
      // Both Alice and Bob should have rewards
      const aliceRewards = await stakingRewards.earned(aliceAddress);
      const bobRewards = await stakingRewards.earned(bobAddress);
      
      expect(aliceRewards).to.be.gt(0);
      expect(bobRewards).to.be.gt(0);
      
      // Alice should have more rewards than Bob since she staked more earlier
      expect(aliceRewards).to.be.gt(bobRewards);
    });
  });
});

// Helper function to get the timestamp of the current block
async function getBlockTimestamp(): Promise<number> {
  const blockNumber = await ethers.provider.getBlockNumber();
  const block = await ethers.provider.getBlock(blockNumber);
  return block ? block.timestamp : 0;
}