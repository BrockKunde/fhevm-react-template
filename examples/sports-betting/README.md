# Confidential Sports Betting Platform

A privacy-first sports betting platform built with Fully Homomorphic Encryption (FHE) technology, enabling completely confidential wagering on the blockchain.

## 🔐 Core Concept

This platform leverages **Fully Homomorphic Encryption (FHE)** to create a trustless, privacy-preserving sports betting experience. Unlike traditional betting platforms, all bet amounts, predictions, and user data remain encrypted on-chain, ensuring complete confidentiality while maintaining the transparency and security of blockchain technology.

### Key Features

- **Private Betting**: All wagers and predictions are encrypted using FHE, protecting user privacy
- **Confidential Odds**: Betting odds and pool sizes remain encrypted until match settlement
- **Secure Rewards**: Automated reward distribution through encrypted smart contracts
- **Zero-Knowledge Verification**: Verify wins without revealing bet details
- **On-Chain Privacy**: Complete transaction privacy while maintaining blockchain immutability

## 🎯 How It Works

1. **Match Creation**: Operators create encrypted betting markets for upcoming sports events
2. **Place Bets**: Users submit encrypted bets on match outcomes (win/lose, over/under, handicap)
3. **Encrypted Processing**: All calculations happen on encrypted data without decryption
4. **Match Settlement**: Oracle submits results, contracts calculate payouts on encrypted values
5. **Claim Winnings**: Winners receive payouts automatically with full privacy protection

## 🏆 Supported Bet Types

- **Win/Lose/Draw**: Predict the match outcome
- **Over/Under**: Total goals/points threshold betting
- **Handicap Betting**: Encrypted handicap wagering
- **Loyalty Rewards**: Privacy-preserving reward system for active bettors

## 📡 Smart Contract

**Contract Address**: `0xB539bf7D5960087A2742B8Fd2DceA8aE86E6E516`

**Network**: Zama Sepolia Testnet

The smart contract implements FHE operations using the fhEVM framework, enabling:
- Encrypted bet storage and processing
- Private odds calculations
- Confidential pool management
- Secure payout distribution

## 🎬 Demo

**Live Demo**: [https://confidential-sports-betting.vercel.app/](https://confidential-sports-betting.vercel.app/)

### Video Demonstration

[Watch Demo Video](ConfidentialSportsBetting.mp4) - See the platform in action with live betting scenarios

### On-Chain Transaction Screenshots

All transactions are verifiable on the Zama Sepolia Testnet block explorer while maintaining user privacy through FHE encryption.

#### Example Transactions:
- Encrypted bet placement
- Match creation with encrypted parameters
- Confidential reward distribution
- Privacy-preserving payout claims

*View transactions on [Zama Sepolia Explorer](https://sepolia.etherscan.io/address/0xB539bf7D5960087A2742B8Fd2DceA8aE86E6E516)*

## 🛡️ Privacy Architecture

### FHE Implementation

The platform uses **fhEVM** (Fully Homomorphic Encryption for EVM) to enable:

```
User Bet (Plaintext) → Encryption → FHE Contract (Encrypted) → Processing → Results (Encrypted) → Decryption (Winner Only) → Payout
```

### Privacy Guarantees

- **Bet Amounts**: Encrypted on-chain, only known to the bettor
- **Predictions**: Completely confidential until match settlement
- **Pool Sizes**: Aggregated in encrypted form
- **User Balances**: Private account tracking
- **Win/Loss Records**: Encrypted historical data

## 💎 Technology Stack

- **Smart Contracts**: Solidity with fhEVM extensions
- **Encryption**: TFHE (Torus Fully Homomorphic Encryption)
- **Frontend**: HTML5, JavaScript, Ethers.js
- **Blockchain**: Zama Sepolia Testnet
- **Oracle**: Decentralized sports data feeds

## 🌐 Live Application

**Website**: [https://confidential-sports-betting.vercel.app/](https://confidential-sports-betting.vercel.app/)

**Repository**: [https://github.com/BrockKunde/ConfidentialSportsBetting](https://github.com/BrockKunde/ConfidentialSportsBetting)

## 🔧 Features Overview

### For Bettors
- Connect wallet and place encrypted bets
- View active matches and betting options
- Track personal betting history (encrypted)
- Claim winnings with privacy protection
- Earn loyalty rewards

### For Operators
- Create encrypted betting markets
- Set confidential odds and limits
- Submit match results via oracle
- Manage platform parameters

### Privacy Dashboard
- Encrypted bet tracking
- Confidential statistics
- Private reward tiers
- Anonymous leaderboards

## 🎮 User Interface

The platform features an intuitive interface with:
- Real-time match listings
- Multiple bet type options
- Encrypted balance display
- Privacy-preserving transaction history
- Responsive design for all devices

## 🔒 Security Features

- **Non-custodial**: Users maintain full control of funds
- **Encrypted State**: All sensitive data stored in encrypted form
- **Verifiable Results**: Match outcomes verified on-chain
- **Automated Payouts**: Smart contract-based distribution
- **Access Control**: Role-based permissions for operators

## 📊 Statistics & Analytics

Users can view their betting performance through encrypted analytics:
- Total bets placed (encrypted count)
- Win rate (privacy-preserving calculation)
- Reward tier status
- Historical performance trends

All statistics are calculated on encrypted data, ensuring complete privacy.

## 🌟 Use Cases

1. **Private Sports Wagering**: Bet on your favorite teams without revealing strategies
2. **Confidential Pool Betting**: Join pools without exposing bet sizes
3. **Anonymous High-Roller Betting**: Large wagers with complete privacy
4. **Privacy-First Fantasy Sports**: Encrypted fantasy league betting
5. **Institutional Betting**: Corporate betting with confidentiality

## 🔮 Future Enhancements

- Multi-sport expansion
- Live in-game betting with FHE
- Peer-to-peer encrypted betting markets
- Advanced bet types (parlays, teasers)
- Mobile application
- Cross-chain privacy bridges

## 📜 License

MIT License - Open source and privacy-focused

## 🤝 Contributing

This is an open-source privacy project. Contributions are welcome to enhance the platform's privacy features and user experience.

## ⚠️ Disclaimer

This platform is for demonstration purposes on testnet. Always bet responsibly and comply with local gambling regulations.

---

**Built with Privacy. Powered by FHE. Secured by Blockchain.**

*Experience the future of confidential sports betting at [https://confidential-sports-betting.vercel.app/](https://confidential-sports-betting.vercel.app/)*
