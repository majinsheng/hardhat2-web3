// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EmToken.sol";

/**
 * @title StakingRewards
 * @author EMa
 * @notice This contract allows users to stake tokens and earn rewards.
 * @dev
 *  This is a staking rewards contract where users can stake their EmTokens and earn rewards over time.
 *  The contract implements a time-based reward distribution mechanism where:
 *    - The owner can set the rewards duration and notify the amount of rewards to distribute
 *    - Users can stake tokens, withdraw them, and claim their earned rewards
 *    - Rewards accumulate proportionally to the staked amount and time
 *    - The reward rate is calculated based on the reward amount and duration
 *    - The contract tracks each user's balance and earned rewards
 *
 *  Rewards calculation uses the formula: earned = (balance * (rewardPerToken - userRewardPerTokenPaid)) / 1e18 + rewards
 *  Security considerations:
 *    - Only the owner can set reward parameters
 *    - The contract ensures reward amount doesn't exceed token balance
 *    - All state-changing functions update rewards before execution
 */
contract StakingRewards {
    EmToken public immutable stakingToken;
    EmToken public immutable rewardsToken;
    address public owner;

    uint public duration;
    uint public finishAt;
    uint public updatedAt;
    uint public rewardRate;
    uint public rewardPerTokenStored;

    mapping(address => uint) public userRewardPerTokenPaid;
    mapping(address => uint) public rewards;

    uint public totalSupply;
    mapping(address => uint) public balanceOf;

    /**
     * @notice Restricts function access to the contract owner
     * @dev Used for admin functions that should only be callable by the owner
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    /**
     * @notice Updates reward state before executing a function
     * @dev This modifier recalculates and updates rewards for a specific account
     * @param _account The address for which to update rewards (address(0) for global-only updates)
     */
    modifier updateReward(address _account) {
        rewardPerTokenStored = rewardPerToken();
        updatedAt = lastTimeRewardApplicable();

        if (_account != address(0)) {
            rewards[_account] = earned(_account);
            userRewardPerTokenPaid[_account] = rewardPerTokenStored;
        }

        _;
    }

    /**
     * @notice Initializes the staking rewards contract
     * @dev Sets the owner and configures staking and rewards tokens
     * @param _stakingToken Address of the token that users will stake
     * @param _rewardsToken Address of the token used for rewards
     */
    constructor(address _stakingToken, address _rewardsToken) {
        owner = msg.sender;
        stakingToken = EmToken(_stakingToken);
        rewardsToken = EmToken(_rewardsToken);
    }

    /**
     * @notice Sets the duration for the rewards distribution period
     * @dev Can only be called by the owner and only when the previous rewards period has finished
     * @param _duration The duration in seconds for the rewards distribution
     */
    function setRewardsDuration(uint _duration) external onlyOwner {
        require(finishAt < block.timestamp, "reward duration not finished");
        duration = _duration;
    }

    /**
     * @notice Notifies the contract about the reward amount to be distributed
     * @dev Calculates the reward rate based on duration and updates the finish time
     * @param _amount The amount of tokens to be distributed as rewards
     */
    function notifyRewardAmount(uint _amount) external onlyOwner updateReward(address(0)) {
        if (block.timestamp > finishAt) {
            rewardRate = _amount / duration;
        } else {
            uint remainingRewards = rewardRate * (finishAt - block.timestamp);
            rewardRate = (remainingRewards + _amount) / duration;
        }

        require(rewardRate > 0, "reward rate = 0");
        require(rewardRate * duration <= rewardsToken.balanceOf(address(this)), "reward amount > balance");

        finishAt = block.timestamp + duration;
        updatedAt = block.timestamp;
    }

    /**
     * @notice Allows a user to stake tokens to earn rewards
     * @dev Transfers tokens from user to contract and updates user's balance
     * @param _amount The amount of tokens to stake
     */
    function stake(uint _amount) external updateReward(msg.sender) {
        require(_amount > 0, "amount = 0");
        stakingToken.transferFrom(msg.sender, address(this), _amount);
        balanceOf[msg.sender] += _amount;
        totalSupply += _amount;
    }

    /**
     * @notice Allows a user to withdraw their staked tokens
     * @dev Reduces user's balance and transfers tokens back to the user
     * @param _amount The amount of tokens to withdraw
     */
    function withdraw(uint _amount) external updateReward(msg.sender) {
        require(_amount > 0, "amount = 0");
        balanceOf[msg.sender] -= _amount;
        totalSupply -= _amount;
        stakingToken.transfer(msg.sender, _amount);
    }

    /**
     * @notice Determines the last timestamp that is applicable for rewards
     * @dev Returns the minimum of current timestamp and finish time
     * @return The last timestamp at which rewards are applicable
     */
    function lastTimeRewardApplicable() public view returns (uint) {
        return _min(block.timestamp, finishAt);
    }

    /**
     * @notice Calculates the current reward per token rate
     * @dev Uses a time-weighted formula to determine rewards per token
     * @return The current reward per token rate
     */
    function rewardPerToken() public view returns (uint) {
        if (totalSupply == 0) {
            return rewardPerTokenStored;
        }
        return rewardPerTokenStored + ((rewardRate * (lastTimeRewardApplicable() - updatedAt)) * 1e18) / totalSupply;
    }

    /**
     * @notice Calculates the amount of rewards earned by an account
     * @dev Uses the formula: (balance * (rewardPerToken - userRewardPerTokenPaid)) / 1e18 + rewards
     * @param _account The address for which to calculate earned rewards
     * @return The amount of rewards earned by the account
     */
    function earned(address _account) public view returns (uint) {
        return (balanceOf[_account] * (rewardPerToken() - userRewardPerTokenPaid[_account])) / 1e18 + rewards[_account];
    }

    /**
     * @notice Allows users to claim their earned rewards
     * @dev Transfers earned rewards to the user and resets their reward balance
     */
    function getReward() external updateReward(msg.sender) {
        uint reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            rewardsToken.transfer(msg.sender, reward);
        }
    }

    /**
     * @notice Utility function to find the minimum of two values
     * @dev Used to determine the last applicable time for rewards
     * @param x First value to compare
     * @param y Second value to compare
     * @return The minimum of the two input values
     */
    function _min(uint x, uint y) private pure returns (uint) {
        return x <= y ? x : y;
    }
}
