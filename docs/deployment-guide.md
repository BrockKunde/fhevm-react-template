# Deployment Guide

Complete guide for deploying confidential dApps using the FHEVM SDK.

## Overview

This guide covers:

1. Smart contract deployment
2. Frontend deployment
3. Network configuration
4. Production best practices
5. Testing and verification

## Prerequisites

Before deploying, ensure you have:

- Node.js 18.x or 20.x installed
- Ethereum wallet with testnet ETH
- Hardhat or Foundry for contract deployment
- Domain name (for production)
- SSL certificate (for production)

## Smart Contract Deployment

### 1. Setup Hardhat

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

### 2. Configure Network

Edit `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
      evmVersion: "cancun",
    },
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
    zama: {
      url: "https://devnet.zama.ai",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 8009,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY,
    },
  },
};
```

### 3. Create Deployment Script

Create `scripts/deploy.js`:

```javascript
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying confidential smart contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy your contract
  const Contract = await ethers.getContractFactory("ConfidentialSportsBetting");
  const contract = await Contract.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("Contract deployed to:", address);

  // Save deployment info
  const fs = require("fs");
  const deploymentData = {
    network: network.name,
    contractAddress: address,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    `deployments/${network.name}-${Date.now()}.json`,
    JSON.stringify(deploymentData, null, 2)
  );

  console.log("Deployment data saved to deployments/");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### 4. Deploy

```bash
# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Deploy to Zama devnet
npx hardhat run scripts/deploy.js --network zama
```

### 5. Verify on Etherscan

Create `scripts/verify.js`:

```javascript
const { run } = require("hardhat");

async function main() {
  const contractAddress = "0xYourDeployedContractAddress";
  const constructorArguments = [];

  console.log("Verifying contract on Etherscan...");

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArguments,
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    if (error.message.includes("already verified")) {
      console.log("Contract already verified");
    } else {
      console.error("Verification error:", error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

Run verification:

```bash
npx hardhat run scripts/verify.js --network sepolia
```

## Frontend Deployment

### Next.js Application

#### 1. Build Configuration

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
    NEXT_PUBLIC_GATEWAY_URL: process.env.NEXT_PUBLIC_GATEWAY_URL,
  },
  // Optimize for production
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

module.exports = nextConfig;
```

#### 2. Environment Variables

Create `.env.production`:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddress
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_GATEWAY_URL=https://gateway.zama.ai
```

#### 3. Build and Export

```bash
# Build for production
npm run build

# Test production build locally
npm run start

# Export static files (optional)
npm run export
```

#### 4. Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

Or connect your GitHub repository to Vercel for automatic deployments.

### Vanilla JavaScript (Static)

#### 1. Build with Vite

```bash
npm run build
```

#### 2. Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

#### 3. Deploy to GitHub Pages

Add to `package.json`:

```json
{
  "homepage": "https://yourusername.github.io/your-repo",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

Deploy:

```bash
npm install --save-dev gh-pages
npm run deploy
```

## Network Configuration

### Sepolia Testnet

```typescript
const SEPOLIA_CONFIG = {
  chainId: 11155111,
  name: 'Sepolia',
  rpcUrl: 'https://rpc.sepolia.org',
  blockExplorer: 'https://sepolia.etherscan.io',
  gatewayUrl: 'https://gateway.zama.ai',
};
```

### Zama Devnet

```typescript
const ZAMA_CONFIG = {
  chainId: 8009,
  name: 'Zama Devnet',
  rpcUrl: 'https://devnet.zama.ai',
  blockExplorer: 'https://explorer.zama.ai',
  gatewayUrl: 'https://gateway.zama.ai',
};
```

### Mainnet (Future)

```typescript
const MAINNET_CONFIG = {
  chainId: 1,
  name: 'Ethereum Mainnet',
  rpcUrl: process.env.MAINNET_RPC_URL,
  blockExplorer: 'https://etherscan.io',
  gatewayUrl: 'https://gateway.zama.ai',
};
```

## Environment Variables

### Smart Contract (.env)

```bash
# Network Configuration
SEPOLIA_RPC_URL=https://rpc.sepolia.org
ZAMA_RPC_URL=https://devnet.zama.ai

# Deployment
PRIVATE_KEY=your_private_key_here
DEPLOYER_ADDRESS=0xYourAddress

# Verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# Contract Configuration
MIN_BET_AMOUNT=0.01
MAX_BET_AMOUNT=10
ORACLE_ADDRESS=0xOracleAddress
```

### Frontend (.env.production)

```bash
# Contract
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContractAddress
NEXT_PUBLIC_CHAIN_ID=11155111

# FHEVM
NEXT_PUBLIC_GATEWAY_URL=https://gateway.zama.ai
NEXT_PUBLIC_ACL_ADDRESS=0xACLAddress

# Network
NEXT_PUBLIC_RPC_URL=https://rpc.sepolia.org
NEXT_PUBLIC_BLOCK_EXPLORER=https://sepolia.etherscan.io

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_APP_ENV=production
```

## Production Best Practices

### 1. Security

- Never commit private keys or secrets
- Use environment variables for all sensitive data
- Enable SSL/TLS for all connections
- Implement rate limiting on API endpoints
- Use Content Security Policy (CSP) headers
- Enable CORS properly

### 2. Performance

- Enable CDN for static assets
- Implement caching strategies
- Optimize bundle size
- Lazy load components
- Use code splitting
- Compress images and assets

### 3. Monitoring

Set up monitoring with tools like:

- **Sentry** for error tracking
- **Google Analytics** for user analytics
- **Etherscan** API for contract monitoring
- **Grafana** for infrastructure monitoring

Example Sentry integration:

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_APP_ENV,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### 4. Testing

Before deploying to production:

```bash
# Run all tests
npm test

# Check code coverage
npm run coverage

# Run linting
npm run lint

# Type checking
npm run type-check

# Build test
npm run build
```

### 5. Backup and Recovery

- Backup contract ABIs and deployment addresses
- Document deployment process
- Keep copies of environment configurations
- Maintain deployment logs
- Test recovery procedures

## CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_CONTRACT_ADDRESS: ${{ secrets.CONTRACT_ADDRESS }}
          NEXT_PUBLIC_CHAIN_ID: ${{ secrets.CHAIN_ID }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Post-Deployment Checklist

- [ ] Contract deployed and verified on Etherscan
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured
- [ ] SSL certificate active
- [ ] Monitoring and analytics enabled
- [ ] Error tracking configured
- [ ] Documentation updated
- [ ] Team notified
- [ ] Social media announcements
- [ ] User testing completed

## Troubleshooting

### Contract Deployment Issues

**Problem**: Out of gas error

**Solution**: Increase gas limit in deployment script:

```javascript
const contract = await Contract.deploy({
  gasLimit: 5000000
});
```

**Problem**: Nonce too low

**Solution**: Reset account nonce or wait for pending transactions.

### Frontend Deployment Issues

**Problem**: Environment variables not working

**Solution**: Ensure variables are prefixed with `NEXT_PUBLIC_` for Next.js.

**Problem**: Build fails with module not found

**Solution**: Clear cache and reinstall:

```bash
rm -rf node_modules .next
npm install
npm run build
```

### Network Issues

**Problem**: Cannot connect to gateway

**Solution**: Check gateway URL and network connectivity:

```typescript
const response = await fetch(GATEWAY_URL + '/health');
console.log('Gateway status:', response.status);
```

## Rollback Procedure

If issues occur after deployment:

1. **Frontend**: Revert to previous deployment in Vercel/Netlify dashboard
2. **Contract**: Deploy new version or use proxy pattern for upgrades
3. **Environment**: Restore from backup configuration
4. **Notify Users**: Communicate issues and expected resolution time

## Support

For deployment assistance:

- Documentation: [docs.zama.ai](https://docs.zama.ai)
- Discord: [discord.gg/zama](https://discord.gg/zama)
- GitHub Issues: [github.com/zama-ai/fhevm](https://github.com/zama-ai/fhevm)

## License

MIT
