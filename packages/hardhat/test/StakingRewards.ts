import { expect } from "chai";
import { ethers, network } from "hardhat";
import { EmToken, StakingRewards } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("StakingRewards Contract", function () {
  // Contracts
  let stakingToken: EmToken;
  let rewardsToken: EmToken;
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
  const rewardAmount = ethers.parseUnits("50", "ether");
  const rewardDuration = 86400; // 1 day in seconds

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
    const EmTokenFactory = await ethers.getContractFactory("EmToken");
    stakingToken = await EmTokenFactory.deploy("Staking Token", "EST", initialSupply) as EmToken;
    rewardsToken = await EmTokenFactory.deploy("Rewards Token", "ERT", initialSupply) as EmToken;

    // Deploy staking rewards contract
    const StakingRewardsFactory = await ethers.getContractFactory("StakingRewards");
    stakingRewards = await StakingRewardsFactory.deploy(
      await stakingToken.getAddress(),
      await rewardsToken.getAddress()
    ) as StakingRewards;

    // Transfer tokens to users for testing
    await stakingToken.transfer(aliceAddress, stakingAmount);
    await stakingToken.transfer(bobAddress, stakingAmount);

    // Transfer rewards to the staking contract
    await rewardsToken.transfer(
      await stakingRewards.getAddress(),
      rewardAmount
    );

    // Set up the rewards parameters
    await stakingRewards.setRewardsDuration(rewardDuration);
    await stakingRewards.notifyRewardAmount(rewardAmount);

    // Approve the staking contract to spend tokens
    await stakingToken.connect(alice).approve(
      await stakingRewards.getAddress(),
      stakingAmount
    );
    await stakingToken.connect(bob).approve(
      await stakingRewards.getAddress(),
      stakingAmount
    );
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await stakingRewards.owner()).to.equal(ownerAddress);
    });

    it("Should set the correct token addresses", async function () {
      expect(await stakingRewards.stakingToken()).to.equal(
        await stakingToken.getAddress()
      );
      expect(await stakingRewards.rewardsToken()).to.equal(
        await rewardsToken.getAddress()
      );
    });

    it("Should have the correct reward rate", async function () {
      // Reward rate should be rewardAmount / duration
      expect(await stakingRewards.rewardRate()).to.equal(
        rewardAmount / BigInt(rewardDuration)
      );
    });
  });

  describe("Staking", function () {
    it("Should allow users to stake tokens", async function () {
      await stakingRewards.connect(alice).stake(stakingAmount);

      expect(await stakingRewards.balanceOf(aliceAddress)).to.equal(stakingAmount);
      expect(await stakingRewards.totalSupply()).to.equal(stakingAmount);
    });

    it("Should revert if staking zero amount", async function () {
      await expect(stakingRewards.connect(alice).stake(0)).to.be.revertedWith(
        "amount = 0"
      );
    });

    it("Should update balances correctly when multiple users stake", async function () {
      const aliceStakeAmount = ethers.parseUnits("5", "ether");
      const bobStakeAmount = ethers.parseUnits("7", "ether");

      await stakingRewards.connect(alice).stake(aliceStakeAmount);
      await stakingRewards.connect(bob).stake(bobStakeAmount);

      expect(await stakingRewards.balanceOf(aliceAddress)).to.equal(
        aliceStakeAmount
      );
      expect(await stakingRewards.balanceOf(bobAddress)).to.equal(
        bobStakeAmount
      );
      expect(await stakingRewards.totalSupply()).to.equal(
        aliceStakeAmount + bobStakeAmount
      );
    });
  });

  describe("Withdrawing", function () {
    beforeEach(async function () {
      // Stake tokens before tests
      await stakingRewards.connect(alice).stake(stakingAmount);
    });

    it("Should allow users to withdraw staked tokens", async function () {
      await stakingRewards.connect(alice).withdraw(stakingAmount);

      expect(await stakingRewards.balanceOf(aliceAddress)).to.equal(0);
      expect(await stakingRewards.totalSupply()).to.equal(0);
      expect(await stakingToken.balanceOf(aliceAddress)).to.equal(stakingAmount);
    });

    it("Should revert if withdrawing zero amount", async function () {
      await expect(
        stakingRewards.connect(alice).withdraw(0)
      ).to.be.revertedWith("amount = 0");
    });

    it("Should revert if withdrawing more than staked", async function () {
      const excessAmount = stakingAmount + ethers.parseUnits("1", "ether");
      
      // This should underflow and revert
      await expect(
        stakingRewards.connect(alice).withdraw(excessAmount)
      ).to.be.reverted;
    });
  });

  describe("Rewards", function () {
    it("Should calculate rewards correctly for a single staker", async function () {
      // Alice stakes
      await stakingRewards.connect(alice).stake(stakingAmount);

      // Move forward half the reward duration
      await increaseTime(rewardDuration / 2);

      // Calculate expected rewards (half of total rewards since one staker for half the time)
      const expectedReward = rewardAmount / BigInt(2);

      // Get earned rewards (should be close to expected but not exact due to block time variations)
      const earned = await stakingRewards.earned(aliceAddress);
      
      // Allow for small deviation due to block timestamp variations
      expect(earned).to.be.closeTo(expectedReward, ethers.parseUnits("0.1", "ether"));
    });

    it("Should distribute rewards proportionally to stake amount", async function () {
      // Alice stakes 1/3 of the total stake
      const aliceStake = ethers.parseUnits("5", "ether");
      // Bob stakes 2/3 of the total stake
      const bobStake = ethers.parseUnits("10", "ether");
      
      await stakingRewards.connect(alice).stake(aliceStake);
      await stakingRewards.connect(bob).stake(bobStake);

      // Move forward full duration
      await increaseTime(rewardDuration);

      // Calculate expected rewards based on proportion of stake
      // Alice should get 1/3 of rewards, Bob should get 2/3
      const totalStake = aliceStake + bobStake;
      const expectedAliceReward = (rewardAmount * aliceStake) / totalStake;
      const expectedBobReward = (rewardAmount * bobStake) / totalStake;

      const aliceEarned = await stakingRewards.earned(aliceAddress);
      const bobEarned = await stakingRewards.earned(bobAddress);

      // Allow for small deviation due to block timestamp variations
      expect(aliceEarned).to.be.closeTo(
        expectedAliceReward,
        ethers.parseUnits("0.1", "ether")
      );
      expect(bobEarned).to.be.closeTo(
        expectedBobReward,
        ethers.parseUnits("0.1", "ether")
      );
    });

    it("Should allow users to claim rewards", async function () {
      // Alice stakes
      await stakingRewards.connect(alice).stake(stakingAmount);

      // Move forward full duration
      await increaseTime(rewardDuration);

      // Get earned amount before claiming
      const earnedBefore = await stakingRewards.earned(aliceAddress);
      
      // Claim rewards
      await stakingRewards.connect(alice).getReward();
      
      // Check rewards were received
      expect(await rewardsToken.balanceOf(aliceAddress)).to.equal(earnedBefore);
      
      // Check rewards were reset
      expect(await stakingRewards.earned(aliceAddress)).to.equal(0);
    });
  });

  describe("Reward Duration", function () {
    it("Should not allow changing duration while rewards period is active", async function () {
      // The reward period was set in the beforeEach and is active
      await expect(
        stakingRewards.setRewardsDuration(rewardDuration * 2)
      ).to.be.revertedWith("reward duration not finished");

      // Move forward past the finish time
      await increaseTime(rewardDuration + 1);

      // Now it should allow changing the duration
      await stakingRewards.setRewardsDuration(rewardDuration * 2);
      expect(await stakingRewards.duration()).to.equal(rewardDuration * 2);
    });
  });

  describe("Owner Functions", function () {
    it("Should restrict owner functions to the owner", async function () {
      await expect(
        stakingRewards.connect(alice).setRewardsDuration(rewardDuration)
      ).to.be.revertedWith("not owner");

      await expect(
        stakingRewards.connect(alice).notifyRewardAmount(rewardAmount)
      ).to.be.revertedWith("not owner");
    });

    it("Should allow extending rewards with notifyRewardAmount", async function () {
      // Move forward half the duration
      await increaseTime(rewardDuration / 2);

      // Send more rewards to the contract
      await rewardsToken.transfer(
        await stakingRewards.getAddress(),
        rewardAmount
      );

      // Notify of additional rewards
      await stakingRewards.notifyRewardAmount(rewardAmount);

      // Check that finish time was extended
      const finishAt = await stakingRewards.finishAt();
      const expectedFinish = await stakingRewards.updatedAt() + BigInt(rewardDuration);
      
      // Compare with a different approach - using BigInt comparison
      expect(finishAt).to.equal(expectedFinish);
    });
  });
});