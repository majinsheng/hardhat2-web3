// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

import "./StakingToken.sol";
import "./RewardsToken.sol";

/**
 * @title StakingRewards
 * @author EMa
 * @notice This contract allows users to stake tokens and earn rewards.
 */
contract StakingRewards {

    StakingToken public immutable stakingToken;
    RewardsToken public immutable rewardsToken;
    address public owner;
    uint256 public totalSupply;
    uint256 public duration;
    uint256 public rewardsRate;
    struct transactions {
        uint256 startAt;
        uint256 rewardsRateStartAt;
        uint256 amount;
        uint256 claimedAt;
        uint256 rewardsClaimed;
        uint256 amountWithdrawn;
    }

    mapping(address => transactions[]) public transactionsPerAccount;
    mapping(address => uint256) public finishAtPerAccount;
    mapping(address => uint256) public balanceOf;

    // events
    event EventForStake(address indexed user, uint256 amount, uint256 startAt, uint256 rewardsRate);
    event TotalRewards(address indexed user, uint256 reward);
    event StakeWithdrawn(address indexed user, uint256 amount);

    /**
     * @notice Restricts function access to the contract owner
     * @dev Used for admin functions that should only be callable by the owner
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor(address _stakingToken, address _rewardsToken) {
        owner = msg.sender;
        stakingToken = StakingToken(_stakingToken);
        rewardsToken = RewardsToken(_rewardsToken);
        duration = 600; // Default duration set to 10 minutes (600 seconds)
        rewardsRate = 6e16; // Default rewards rate set to 0.06 tokens per second
    }

    function setRewardsDuration(uint256 _duration) external onlyOwner {
        require(_duration > 600, "reward duration should be more than 10 minutes");
        duration = _duration;
    }

    function setRewardsRate(uint256 _rewardsRate) external onlyOwner {
        require(_rewardsRate > 0, "rewards rate should be more than 0");
        rewardsRate = _rewardsRate;
    }

    function getStakingToken() external view returns (address) {
        return address(stakingToken);
    }

    function getRewardsToken() external view returns (address) {
        return address(rewardsToken);
    }

    /**
     * @notice Allows users to stake a specified amount of tokens
     * @param _amount The amount of tokens to stake
     */
    function stake(uint256 _amount) external {
        require(_amount > 0, "amount = 0");
        stakingToken.transferFrom(msg.sender, address(this), _amount);
        balanceOf[msg.sender] += _amount;
        transactionsPerAccount[msg.sender].push(transactions(block.timestamp, rewardsRate, _amount, 0, 0, 0));
        totalSupply += _amount;
        emit EventForStake(msg.sender, _amount, block.timestamp, rewardsRate);
    }

    function withdraw(uint256 _startAt, uint256 _amount) external {
        require(_amount > 0, "withdraw amount should be more than 0");
        balanceOf[msg.sender] -= _amount;
        totalSupply -= _amount;

        transactions[] storage userTransactions = transactionsPerAccount[msg.sender];
        for (uint i = 0; i < userTransactions.length; i++) {
            if (userTransactions[i].startAt == _startAt) {
                require(_amount < userTransactions[i].amount, "withdraw amount exceeds staked amount in this transaction");
                userTransactions[i].amount -= _amount;
                userTransactions[i].amountWithdrawn += _amount;
                break;
            }
        }

        stakingToken.transfer(msg.sender, _amount);

        emit StakeWithdrawn(msg.sender, _amount);
    }

    modifier updateReward(address _account) {
        for (uint i = 0; i < transactionsPerAccount[_account].length; i++) {
            transactions storage txn = transactionsPerAccount[_account][i];
            uint256 timeStaked = 0;
            if (txn.startAt + duration < block.timestamp) {
                timeStaked = block.timestamp - txn.startAt;
            } else {
                timeStaked = duration;
            }
            uint256 totalAmount = (txn.amount - txn.amountWithdrawn) * (timeStaked / duration);
            uint256 rewards = (totalAmount * txn.rewardsRateStartAt) / 1e18;
            txn.rewardsClaimed += rewards;
            txn.claimedAt = block.timestamp;
        }
        _;
    }

    // View function to see pending rewards for an account
    function earned(address _account) public view returns (uint256) {
        uint256 totalRewards = 0;
        for (uint i = 0; i < transactionsPerAccount[_account].length; i++) {
            transactions memory txn = transactionsPerAccount[_account][i];
            uint256 timeStaked = 0;
            if (txn.startAt + duration < block.timestamp) {
                timeStaked = block.timestamp - txn.startAt;
            } else {
                timeStaked = duration;
            }
            uint256 totalAmount = (txn.amount - txn.amountWithdrawn) * (timeStaked / duration);
            uint256 rewards = (totalAmount * txn.rewardsRateStartAt) / 1e18;
            totalRewards += rewards;
        }
        return totalRewards;
    }

    // Claim rewards for the sender
    function claimRewards() external updateReward(msg.sender) {
        uint256 reward = earned(msg.sender);
        require(reward > 0, "no rewards to claim");
        rewardsToken.mint(msg.sender, reward);
        emit TotalRewards(msg.sender, reward);
    }
}