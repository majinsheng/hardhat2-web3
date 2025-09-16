"use client";

import { useEffect, useState } from "react";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { EtherInput } from "~~/components/scaffold-eth/Input/EtherInput";
import { useScaffoldContract, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export const StakingRewards = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [stakeAmount, setStakeAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [rewardsDuration, setRewardsDuration] = useState("");
  const [rewardsAmount, setRewardsAmount] = useState("");

  useEffect(() => {
    if (!isConnected) {
      notification.error("Please connect your wallet to interact with the staking contract");
    }
  }, [isConnected]);

  // Contract hooks
  const { data: stakingRewardsContract } = useScaffoldContract({
    contractName: "StakingRewards",
  });

  // Read from the contract
  const { data: stakedBalance } = useScaffoldReadContract({
    contractName: "StakingRewards",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: earnedRewards } = useScaffoldReadContract({
    contractName: "StakingRewards",
    functionName: "earned",
    args: [connectedAddress],
  });

  const { data: totalStaked } = useScaffoldReadContract({
    contractName: "StakingRewards",
    functionName: "totalSupply",
  });

  const { data: rewardRate } = useScaffoldReadContract({
    contractName: "StakingRewards",
    functionName: "rewardRate",
  });

  const { data: finishAt } = useScaffoldReadContract({
    contractName: "StakingRewards",
    functionName: "finishAt",
  });

  const { data: stakingTokenBalance } = useScaffoldReadContract({
    contractName: "StakingToken",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: rewardsTokenBalance } = useScaffoldReadContract({
    contractName: "RewardsToken",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: stakingTokenName } = useScaffoldReadContract({
    contractName: "StakingToken",
    functionName: "name",
  });

  const { data: rewardsTokenName } = useScaffoldReadContract({
    contractName: "RewardsToken",
    functionName: "name",
  });

  // Interaction functions
  const { writeContractAsync: approveStakingTokenAsync } = useScaffoldWriteContract({
    contractName: "StakingToken",
  });

  const approveStakingToken = async () => {
    try {
      const result = await approveStakingTokenAsync({
        functionName: "approve",
        args: [stakingRewardsContract?.address, stakeAmount ? parseEther(stakeAmount as `${number}`) : BigInt(0)],
      });
      if (result) {
        notification.success("Approval confirmed!");
      }
    } catch (error) {
      console.error("Error approving token:", error);
      notification.error("Failed to approve token");
    }
  };

  const { writeContractAsync: stakeTokensAsync } = useScaffoldWriteContract({
    contractName: "StakingRewards",
  });

  const stakeTokens = async () => {
    try {
      const result = await stakeTokensAsync({
        functionName: "stake",
        args: [stakeAmount ? parseEther(stakeAmount as `${number}`) : BigInt(0)],
      });
      if (result) {
        notification.success("Tokens staked successfully!");
        setStakeAmount("");
      }
    } catch (error) {
      console.error("Error staking tokens:", error);
      notification.error("Failed to stake tokens");
    }
  };

  const { writeContractAsync: withdrawTokensAsync } = useScaffoldWriteContract({
    contractName: "StakingRewards",
  });

  const withdrawTokens = async () => {
    try {
      const result = await withdrawTokensAsync({
        functionName: "withdraw",
        args: [withdrawAmount ? parseEther(withdrawAmount as `${number}`) : BigInt(0)],
      });
      if (result) {
        notification.success("Tokens withdrawn successfully!");
        setWithdrawAmount("");
      }
    } catch (error) {
      console.error("Error withdrawing tokens:", error);
      notification.error("Failed to withdraw tokens");
    }
  };

  const { writeContractAsync: claimRewardsAsync } = useScaffoldWriteContract({
    contractName: "StakingRewards",
  });

  const claimRewards = async () => {
    try {
      const result = await claimRewardsAsync({
        functionName: "getReward",
      });
      if (result) {
        notification.success("Rewards claimed successfully!");
      }
    } catch (error) {
      console.error("Error claiming rewards:", error);
      notification.error("Failed to claim rewards");
    }
  };

  const { writeContractAsync: setDurationAsync } = useScaffoldWriteContract({
    contractName: "StakingRewards",
  });

  const setDuration = async () => {
    try {
      const result = await setDurationAsync({
        functionName: "setRewardsDuration",
        args: [rewardsDuration ? BigInt(rewardsDuration) : BigInt(0)],
      });
      if (result) {
        notification.success("Rewards duration set successfully!");
        setRewardsDuration("");
      }
    } catch (error) {
      console.error("Error setting rewards duration:", error);
      notification.error("Failed to set rewards duration");
    }
  };

  const { writeContractAsync: approveRewardsTokenAsync } = useScaffoldWriteContract({
    contractName: "RewardsToken",
  });

  const approveRewardsToken = async () => {
    try {
      const result = await approveRewardsTokenAsync({
        functionName: "approve",
        args: [stakingRewardsContract?.address, rewardsAmount ? parseEther(rewardsAmount) : BigInt(0)],
      });
      if (result) {
        notification.success("Approval confirmed!");
      }
    } catch (error) {
      console.error("Error approving token:", error);
      notification.error("Failed to approve token");
    }
  };

  const { writeContractAsync: notifyRewardAmountAsync } = useScaffoldWriteContract({
    contractName: "StakingRewards",
  });

  const notifyRewardAmount = async () => {
    try {
      const result = await notifyRewardAmountAsync({
        functionName: "notifyRewardAmount",
        args: [rewardsAmount ? parseEther(rewardsAmount) : BigInt(0)],
      });
      if (result) {
        notification.success("Rewards amount notified successfully!");
        setRewardsAmount("");
      }
    } catch (error) {
      console.error("Error notifying reward amount:", error);
      notification.error("Failed to notify reward amount");
    }
  };

  const { data: owner } = useScaffoldReadContract({
    contractName: "StakingRewards",
    functionName: "owner",
  });

  // Check if connected address is owner
  const isOwner = owner === connectedAddress;

  // Handle staking
  const handleStake = async () => {
    try {
      await approveStakingToken();
      await stakeTokens();
    } catch (error) {
      console.error("Error staking tokens:", error);
      notification.error("Failed to stake tokens");
    }
  };

  // Handle withdrawing
  const handleWithdraw = async () => {
    try {
      await withdrawTokens();
    } catch (error) {
      console.error("Error withdrawing tokens:", error);
      notification.error("Failed to withdraw tokens");
    }
  };

  // Handle claiming rewards
  const handleClaimRewards = async () => {
    try {
      await claimRewards();
    } catch (error) {
      console.error("Error claiming rewards:", error);
      notification.error("Failed to claim rewards");
    }
  };

  // Handle setting rewards duration (owner only)
  const handleSetDuration = async () => {
    try {
      await setDuration();
    } catch (error) {
      console.error("Error setting rewards duration:", error);
      notification.error("Failed to set rewards duration");
    }
  };

  // Handle notifying reward amount (owner only)
  const handleNotifyRewardAmount = async () => {
    try {
      await approveRewardsToken();
      await notifyRewardAmount();
    } catch (error) {
      console.error("Error notifying reward amount:", error);
      notification.error("Failed to notify reward amount");
    }
  };

  // Format time remaining for rewards
  const getTimeRemaining = () => {
    if (!finishAt) return "No active rewards period";

    const currentTime = Math.floor(Date.now() / 1000);
    const finishTime = Number(finishAt);

    if (currentTime >= finishTime) return "Rewards period ended";

    const secondsRemaining = finishTime - currentTime;
    const days = Math.floor(secondsRemaining / 86400);
    const hours = Math.floor((secondsRemaining % 86400) / 3600);
    const minutes = Math.floor((secondsRemaining % 3600) / 60);

    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
      {/* User Info */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl">Your Staking Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="stat bg-base-200 rounded-xl p-4">
              <div className="stat-title">Staked Balance</div>
              <div className="stat-value text-primary">
                {stakedBalance ? parseFloat(formatEther(stakedBalance)).toFixed(4) : "0"} {stakingTokenName || "Tokens"}
              </div>
            </div>
            <div className="stat bg-base-200 rounded-xl p-4">
              <div className="stat-title">Earned Rewards</div>
              <div className="stat-value text-secondary">
                {earnedRewards ? parseFloat(formatEther(earnedRewards)).toFixed(4) : "0"} {rewardsTokenName || "Tokens"}
              </div>
            </div>
            <div className="stat bg-base-200 rounded-xl p-4">
              <div className="stat-title">Available to Stake</div>
              <div className="stat-value text-accent">
                {stakingTokenBalance ? parseFloat(formatEther(stakingTokenBalance)).toFixed(4) : "0"}{" "}
                {stakingTokenName || "Tokens"}
              </div>
            </div>
            <div className="stat bg-base-200 rounded-xl p-4">
              <div className="stat-title">Rewards Balance</div>
              <div className="stat-value">
                {rewardsTokenBalance ? parseFloat(formatEther(rewardsTokenBalance)).toFixed(4) : "0"}{" "}
                {rewardsTokenName || "Tokens"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Staking Stats */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl">Staking Pool Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="stat bg-base-200 col-span-2 rounded-xl p-4">
              <div className="stat-title">Total Staked</div>
              <div className="stat-value">
                {totalStaked ? parseFloat(formatEther(totalStaked)).toFixed(4) : "0"} {stakingTokenName || "Tokens"}
              </div>
            </div>
            <div className="stat bg-base-200 rounded-xl p-4">
              <div className="stat-title">Reward Rate</div>
              <div className="stat-value">{rewardRate ? parseFloat(formatEther(rewardRate)).toFixed(8) : "0"}/sec</div>
            </div>
            <div className="stat bg-base-200 rounded-xl p-4">
              <div className="stat-title">Rewards End In</div>
              <div className="stat-value text-sm">{getTimeRemaining()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* User Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stake */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Stake Tokens</h2>
            <div className="form-control">
              <label className="label">
                <span className="label-text mb-2">Amount to Stake</span>
              </label>
              <div className="input-group">
                <EtherInput
                  placeholder="Amount to send"
                  value={stakeAmount}
                  onChange={value => setStakeAmount(value)}
                />
                <button className="btn btn-primary mt-2" onClick={handleStake} disabled={!isConnected || !stakeAmount}>
                  Stake
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Withdraw */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Withdraw Tokens</h2>
            <div className="form-control">
              <label className="label">
                <span className="label-text mb-2">Amount to Withdraw</span>
              </label>
              <div className="input-group">
                <EtherInput
                  placeholder="Amount to send"
                  value={withdrawAmount}
                  onChange={value => setWithdrawAmount(value)}
                />
                <button
                  className="btn btn-secondary mt-2"
                  onClick={handleWithdraw}
                  disabled={!isConnected || !withdrawAmount}
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Claim Rewards */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body flex flex-row items-center justify-between">
          <div>
            <h2 className="card-title">Claim Your Rewards</h2>
            <p className="text-sm mt-1">
              Claim {earnedRewards ? parseFloat(formatEther(earnedRewards)).toFixed(4) : "0"}{" "}
              {rewardsTokenName || "Tokens"}
            </p>
          </div>
          <button
            className="btn btn-accent"
            onClick={handleClaimRewards}
            disabled={!isConnected || !earnedRewards || earnedRewards <= BigInt(0)}
          >
            Claim Rewards
          </button>
        </div>
      </div>

      {/* Owner Actions - only shown to contract owner */}
      {isOwner && (
        <div className="card bg-base-100 shadow-xl border-2 border-primary">
          <div className="card-body">
            <h2 className="card-title text-xl text-primary">Owner Controls</h2>
            <div className="divider"></div>

            {/* Set Rewards Duration */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Set Rewards Duration (seconds)</span>
              </label>
              <div className="input-group">
                <input
                  type="number"
                  placeholder="86400"
                  className="input input-bordered w-full"
                  value={rewardsDuration}
                  onChange={e => setRewardsDuration(e.target.value)}
                />
                <button className="btn btn-primary mt-2" onClick={handleSetDuration} disabled={!rewardsDuration}>
                  Set Duration
                </button>
              </div>
            </div>

            {/* Notify Reward Amount */}
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Notify Reward Amount</span>
              </label>
              <div className="input-group">
                <input
                  type="number"
                  placeholder="0.0"
                  className="input input-bordered w-full"
                  value={rewardsAmount}
                  onChange={e => setRewardsAmount(e.target.value)}
                />
                <button className="btn btn-primary mt-2" onClick={handleNotifyRewardAmount} disabled={!rewardsAmount}>
                  Notify Amount
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
