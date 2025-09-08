
⚙️ Built using NextJS, RainbowKit, Hardhat, Wagmi, Viem, and Typescript.

<img width="1910" height="990" alt="image" src="https://github.com/user-attachments/assets/673250a6-6cac-44b9-8499-dc9dad598efe" />

## Project Structure

```
/
├── packages/
│   ├── hardhat/                  # Ethereum development environment
│   │   ├── contracts/            # Smart contracts
│   │   │   └── YourContract.sol  # Example contract
│   │   ├── deploy/               # Deployment scripts
│   │   │   └── 00_deploy_your_contract.ts
│   │   ├── scripts/              # Utility scripts
│   │   │   ├── generateAccount.ts
│   │   │   ├── generateTsAbis.ts
│   │   │   ├── importAccount.ts
│   │   │   ├── listAccount.ts
│   │   │   ├── revealPK.ts
│   │   │   └── runHardhatDeployWithPK.ts
│   │   └── test/                 # Contract tests
│   │       └── YourContract.ts
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

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

Run smart contract test with `yarn hardhat:test`

- Edit your smart contracts in `packages/hardhat/contracts`
- Edit your frontend homepage at `packages/nextjs/app/page.tsx`. For guidance on [routing](https://nextjs.org/docs/app/building-your-application/routing/defining-routes) and configuring [pages/layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts) checkout the Next.js documentation.
- Edit your deployment scripts in `packages/hardhat/deploy`

