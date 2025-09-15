
⚙️ Built using NextJS, RainbowKit, Hardhat, Wagmi, Viem, and Typescript.

https://github.com/user-attachments/assets/ee7d07ac-4033-4dcc-b5aa-a1464341130a

<hr>
WEB3 Architecture from https://www.preethikasireddy.com/post/the-architecture-of-a-web-3-0-application
<img width="1658" height="1412" alt="image" src="https://github.com/user-attachments/assets/42470498-b274-416a-8342-d7f0e7c8bf1b" />
<hr>

## Project Structure

```
/
├── packages/
│   ├── hardhat/                  # Ethereum development environment
│   │   ├── contracts/            # Smart contracts
│   │   │   ├── EmToken.sol       # ERC20 token for staking and rewards
│   │   │   ├── GreetingContract.sol # Simple greeting contract
│   │   │   ├── SampleNFT.sol     # NFT implementation
│   │   │   └── StakingRewards.sol # Token staking with rewards contract
│   │   ├── deploy/               # Deployment scripts
│   │   │   ├── 00_deploy_greeting_contract.ts
│   │   │   ├── 01_deploy_sample_ntf.ts
│   │   │   └── 02_deploy_staking_rewards.ts
│   │   ├── scripts/              # Utility scripts
│   │   │   ├── generateAccount.ts
│   │   │   ├── generateTsAbis.ts
│   │   │   ├── importAccount.ts
│   │   │   ├── listAccount.ts
│   │   │   ├── revealPK.ts
│   │   │   └── runHardhatDeployWithPK.ts
│   │   └── test/                 # Contract tests
│   │       ├── GreetingContract.ts
│   │       ├── SampleNFT.ts
│   │       └── StakingRewards.ts
│   │
│   └── nextjs/                   # Frontend application
│       ├── app/                  # App router based pages
│       │   ├── blockexplorer/    # Block explorer feature
│       │   ├── debug/            # Contract debugging tools
│       │   └── page.tsx          # Homepage
│       ├── components/           # React components
│       │   ├── scaffold-eth/     # Scaffold-ETH specific components
│       │   └── ...
│       ├── contracts/            # Contract connection config
│       ├── hooks/                # Custom React hooks
│       │   └── scaffold-eth/     # Scaffold-ETH specific hooks
│       ├── public/               # Public assets
│       ├── services/             # Service layer
│       ├── styles/               # CSS styles
│       └── utils/                # Utility functions
│
├── CONTRIBUTING.md              # Contribution guidelines
├── LICENCE                      # Project license
├── package.json                 # Root package.json
└── README.md                    # Project documentation
```

The project follows a monorepo structure with two main packages:

1. **Hardhat Package** (`packages/hardhat/`): Contains everything related to smart contracts:
   - Smart contract source code in Solidity
   - Deployment scripts for different environments
   - Test files for contract functionality
   - Utility scripts for account management and more

   **Key Contracts:**
   - **EmToken**: A simple ERC20 token implementation used for staking and rewards.
   - **GreetingContract**: A basic contract that stores and updates a greeting message.
   - **SampleNFT**: An NFT (ERC721) implementation with minting functionality.
   - **StakingRewards**: A staking contract that allows users to stake EmTokens and earn rewards over time.

2. **NextJS Package** (`packages/nextjs/`): Contains the frontend application:
   - App router-based pages and layouts
   - React components including specific Scaffold-ETH components
   - Custom hooks for blockchain interaction
   - Utilities for web3 functionality

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v20.18.3)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started, follow the steps below:

1. Install dependencies if it was skipped in CLI:

```
cd my-dapp-example
yarn install
```

2. Run a local network in the first terminal:

```
yarn chain
```

This command starts a local Ethereum network using Hardhat. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in `packages/hardhat/hardhat.config.ts`.

3. On a second terminal, deploy the test contract:

```
yarn deploy
```

This command deploys a test smart contract to the local network. The contract is located in `packages/hardhat/contracts` and can be modified to suit your needs. The `yarn deploy` command uses the deploy script located in `packages/hardhat/deploy` to deploy the contract to the network. You can also customize the deploy script.

4. On a third terminal, start your NextJS app:

```
yarn start
```

## Staking Functionality

The project includes a staking rewards system with the following components:

### EmToken Contract
A standard ERC20 token with minting capabilities, used both as the staking token and rewards token.

### StakingRewards Contract
The main staking contract with the following features:
- Users can stake their EmTokens and earn rewards over time
- Rewards are distributed based on the amount staked and the duration
- The contract owner can set the rewards duration and notify the amount of rewards to distribute
- Users can withdraw their staked tokens and claim earned rewards at any time
- Rewards accumulate proportionally to the staked amount and time

### Testing
Comprehensive test coverage for the staking system is available in `packages/hardhat/test/StakingRewards.ts`, including:
- Deployment verification
- Staking and withdrawal functionality
- Reward calculations and distribution
- Owner-only functions

To run the staking rewards tests:
```
cd packages/hardhat
npx hardhat test test/StakingRewards.ts
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

Run smart contract test with `yarn hardhat:test`

- Edit your smart contracts in `packages/hardhat/contracts`
- Edit your frontend homepage at `packages/nextjs/app/page.tsx`. For guidance on [routing](https://nextjs.org/docs/app/building-your-application/routing/defining-routes) and configuring [pages/layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts) checkout the Next.js documentation.
- Edit your deployment scripts in `packages/hardhat/deploy`

