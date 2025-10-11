# Confidential Sports Betting Platform

A fully confidential sports betting platform built with FHEVM that ensures private predictions and fair outcomes.

## Features

- **Encrypted Predictions**: All bet predictions are encrypted using FHEVM, ensuring no one can see your choices until match completion
- **Pool-Based Payouts**: Winners share the losing pool proportionally based on their bet amounts
- **Multiple Bet Types**: Support for Win/Lose, Over/Under, and Handicap betting
- **Oracle-Based Settlement**: Trusted oracles finalize match results to determine winners
- **Fair & Transparent**: All logic executed on-chain with encrypted state

## Architecture

### Smart Contract

The `ConfidentialSportsBetting.sol` contract implements:

- **Encrypted Bets**: Uses `euint8` for storing encrypted predictions
- **Access Control**: Owner and oracle authorization patterns
- **Match Lifecycle**: Created → Active → Finished/Cancelled states
- **Automatic Refunds**: Cancelled matches automatically refund all bettors

### Frontend Integration

Built with Next.js and `@fhevm/sdk`, the frontend provides:

- Wallet connection via MetaMask
- FHEVM initialization and status tracking
- Encrypted bet placement using SDK hooks
- Match browsing and selection
- Winnings claiming interface

## Quick Start

### Prerequisites

- Node.js 18.x or 20.x
- MetaMask wallet
- Sepolia testnet ETH

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit [http://localhost:3001](http://localhost:3001)

## Usage Example

```typescript
import { useFhevmClient, useEncryptInput, useFhevmContract } from '@fhevm/sdk/react';

// Initialize FHEVM
const { client, isInitialized } = useFhevmClient({ provider, signer });

// Encrypt bet prediction
const { encrypt } = useEncryptInput();
const encrypted = await encrypt({
  values: [{ value: 0, type: 'euint8' }], // 0 = Home, 1 = Away
  contractAddress: CONTRACT_ADDRESS,
  userAddress: userAddress,
});

// Place bet
const tx = await contract.placeBet(matchId, betType, prediction, betOptions, {
  value: ethers.parseEther('0.1')
});
```

## Contract Functions

### User Functions

- `placeBet(matchId, betType, prediction, betOptions)` - Place an encrypted bet
- `claimWinnings(matchId)` - Claim winnings for a finished match
- `getMatchBasicInfo(matchId)` - View match details
- `getMatchStatus(matchId)` - Check match status and betting pools
- `getBetBasicInfo(matchId, bettor)` - View bet information

### Oracle Functions

- `createMatch(...)` - Create a new betting match
- `finishMatch(matchId, homeScore, awayScore)` - Finalize match results
- `cancelMatch(matchId)` - Cancel match and refund all bets

### Owner Functions

- `authorizeOracle(oracle)` - Authorize an oracle address
- `revokeOracle(oracle)` - Revoke oracle authorization
- `withdraw()` - Withdraw contract balance

## Bet Types

1. **Win/Lose**: Predict which team will win
2. **Over/Under**: Predict if total score will be over or under a target
3. **Handicap**: Predict outcome with a handicap applied

## Security Features

- Encrypted predictions prevent bet manipulation
- Reentrancy protection on critical functions
- Access control for oracle and owner operations
- Automatic state management and validation

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run coverage
```

## Deployment

The contract is deployed on Sepolia testnet. See the main repository README for deployment details.

## Learn More

- [FHEVM SDK Documentation](../../packages/fhevm-sdk/README.md)
- [API Reference](../../docs/api-reference.md)
- [Deployment Guide](../../docs/deployment-guide.md)

## License

MIT
