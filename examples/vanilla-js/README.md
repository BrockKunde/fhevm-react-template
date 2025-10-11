# Vanilla JavaScript FHEVM Example

A pure vanilla JavaScript example demonstrating FHEVM SDK usage without any framework dependencies.

## Features

- **No Framework Required**: Pure JavaScript with ES modules
- **Interactive UI**: Complete example with wallet connection, encryption, and decryption
- **Live Demonstration**: See FHEVM encryption in action
- **Educational**: Clear code structure with detailed comments

## What This Example Demonstrates

1. **Wallet Connection**: Connect to MetaMask and get user address
2. **FHEVM Client Creation**: Initialize the FHEVM client with provider and signer
3. **FHEVM Initialization**: Download and setup encryption keys
4. **Input Encryption**: Encrypt values before sending to smart contracts
5. **Output Decryption**: Decrypt values from smart contracts (with proper permissions)

## Quick Start

### Prerequisites

- Node.js 18.x or 20.x
- MetaMask browser extension
- Modern web browser with ES modules support

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

### Build

```bash
npm run build
```

## Code Structure

```
vanilla-js/
├── index.html      # Main HTML with UI components
├── main.js         # Core FHEVM logic and event handlers
├── package.json    # Dependencies and scripts
└── README.md       # This file
```

## Usage Example

The example includes a complete workflow:

### 1. Connect Wallet

```javascript
import { ethers } from 'ethers';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const userAddress = await signer.getAddress();
```

### 2. Initialize FHEVM

```javascript
import { createFhevmClient, initFhevm } from '@fhevm/sdk';

const client = createFhevmClient({ provider, signer });
await initFhevm(client);
```

### 3. Encrypt Input

```javascript
import { encryptInput } from '@fhevm/sdk';

const encrypted = await encryptInput({
  values: [{ value: 100, type: 'euint32' }],
  contractAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  userAddress: userAddress,
});

// Use encrypted.handles[0] and encrypted.inputProof in contract calls
console.log('Encrypted handle:', encrypted.handles[0]);
console.log('Input proof:', encrypted.inputProof);
```

### 4. Decrypt Output

```javascript
import { decryptOutput } from '@fhevm/sdk';

const decrypted = await decryptOutput({
  handle: '0x...', // Encrypted handle from contract
  contractAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  userAddress: userAddress,
});

console.log('Decrypted value:', decrypted);
```

## Key Concepts

### Encrypted Types

The FHEVM SDK supports multiple encrypted types:

- `euint8` - Encrypted 8-bit unsigned integer (0-255)
- `euint16` - Encrypted 16-bit unsigned integer (0-65535)
- `euint32` - Encrypted 32-bit unsigned integer (0-4294967295)
- `euint64` - Encrypted 64-bit unsigned integer (very large numbers)
- `euint128` - Encrypted 128-bit unsigned integer
- `ebool` - Encrypted boolean
- `eaddress` - Encrypted address

### Encryption Flow

1. User enters a value in the UI
2. SDK encrypts the value using FHEVM
3. Encrypted handle and proof are generated
4. These are passed to the smart contract
5. Contract operates on encrypted values without seeing them

### Decryption Flow

1. Contract performs encrypted computations
2. Contract grants decryption permission: `FHE.allow(handle, userAddress)`
3. User requests decryption with EIP-712 signature
4. Gateway validates signature and returns decrypted value
5. User sees the plaintext result

## Integration with Smart Contracts

### Sending Encrypted Data

```solidity
// Smart contract function
function setValue(bytes32 encryptedValue, bytes calldata inputProof) public {
    euint32 encrypted = TFHE.asEuint32(encryptedValue, inputProof);
    myValue = encrypted;
}
```

```javascript
// Frontend call
const encrypted = await encryptInput({
  values: [{ value: 42, type: 'euint32' }],
  contractAddress: contractAddress,
  userAddress: userAddress,
});

await contract.setValue(encrypted.handles[0], encrypted.inputProof);
```

### Receiving Encrypted Data

```solidity
// Smart contract function
function getValue() public view returns (euint32) {
    TFHE.allow(myValue, msg.sender);
    return myValue;
}
```

```javascript
// Frontend call
const handle = await contract.getValue();
const decrypted = await decryptOutput({
  handle: handle,
  contractAddress: contractAddress,
  userAddress: userAddress,
});

console.log('My value:', decrypted);
```

## Browser Compatibility

This example uses modern JavaScript features:

- ES Modules (`import`/`export`)
- `async`/`await`
- BigInt support

Supported browsers:
- Chrome 89+
- Firefox 89+
- Safari 15+
- Edge 89+

## Troubleshooting

### "Please install MetaMask" error

Make sure you have MetaMask browser extension installed and enabled.

### FHEVM initialization fails

- Check your internet connection (needs to download encryption keys)
- Make sure you're on a supported network (Sepolia)
- Try refreshing the page and reconnecting

### Decryption fails

- Ensure the contract has granted you permission with `FHE.allow(handle, yourAddress)`
- Verify the handle is valid and from the correct contract
- Check that you're using the correct contract address

## Learn More

- [FHEVM SDK Documentation](../../packages/fhevm-sdk/README.md)
- [API Reference](../../docs/api-reference.md)
- [Next.js Example](../nextjs-showcase/)
- [Sports Betting Example](../sports-betting/)

## License

MIT
