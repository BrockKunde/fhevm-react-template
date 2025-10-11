# Getting Started with FHEVM SDK

Welcome to the FHEVM SDK! This guide will help you get started building confidential dApps with Fully Homomorphic Encryption.

## What is FHEVM?

FHEVM (Fully Homomorphic Encryption Virtual Machine) allows smart contracts to perform computations on encrypted data without ever decrypting it. This enables truly confidential on-chain applications where sensitive data remains private.

## Key Features

- **Universal**: Works with React, Next.js, Vue, vanilla JavaScript, and Node.js
- **Simple API**: Wagmi-like API that's familiar to web3 developers
- **Type-Safe**: Full TypeScript support with comprehensive type definitions
- **Modular**: Use only what you need - core functions or React hooks
- **Zero Config**: Sensible defaults for quick setup

## Installation

```bash
npm install @fhevm/sdk ethers
```

The SDK requires `ethers` v6.x as a peer dependency.

## Quick Start (< 10 lines!)

```typescript
import { createFhevmClient, initFhevm, encryptInput } from '@fhevm/sdk';
import { ethers } from 'ethers';

// 1. Create client
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const client = createFhevmClient({ provider, signer });

// 2. Initialize FHEVM
await initFhevm(client);

// 3. Encrypt input
const encrypted = await encryptInput({
  values: [{ value: 100, type: 'euint32' }],
  contractAddress: '0x...',
  userAddress: await signer.getAddress(),
});

// 4. Use in contract call
await contract.myFunction(encrypted.handles[0], encrypted.inputProof);
```

## Core Concepts

### 1. FHEVM Client

The FHEVM client is the main entry point for all SDK operations. It manages the connection to your Ethereum provider and handles FHEVM initialization.

```typescript
import { createFhevmClient } from '@fhevm/sdk';

const client = createFhevmClient({
  provider: provider,  // ethers.Provider
  signer: signer,      // ethers.Signer (optional, required for signing)
  config: {
    gatewayUrl: 'https://gateway.zama.ai',  // Optional
    aclAddress: '0x...',                    // Optional
  }
});
```

### 2. Initialization

Before performing any encryption or decryption, you must initialize the FHEVM client. This downloads the necessary encryption keys.

```typescript
import { initFhevm } from '@fhevm/sdk';

await initFhevm(client);
console.log('FHEVM ready!');
```

### 3. Input Encryption

Encrypt data before sending it to your smart contract:

```typescript
import { encryptInput } from '@fhevm/sdk';

const encrypted = await encryptInput({
  values: [
    { value: 42, type: 'euint32' },
    { value: true, type: 'ebool' },
  ],
  contractAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  userAddress: '0xYourAddress',
});

// Use in contract
await contract.submitValues(
  encrypted.handles[0],  // First encrypted value
  encrypted.handles[1],  // Second encrypted value
  encrypted.inputProof   // Proof for both values
);
```

### 4. Output Decryption

Decrypt values returned from your smart contract:

```typescript
import { decryptOutput } from '@fhevm/sdk';

// Get encrypted handle from contract
const encryptedHandle = await contract.getMyValue();

// Decrypt it (requires permission from contract)
const decrypted = await decryptOutput({
  handle: encryptedHandle,
  contractAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  userAddress: '0xYourAddress',
});

console.log('Decrypted value:', decrypted);
```

## React Hooks

For React applications, the SDK provides convenient hooks:

```tsx
import { useFhevmClient, useEncryptInput, useDecryptOutput } from '@fhevm/sdk/react';

function MyComponent() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  // Initialize FHEVM
  const { client, isInitialized, error } = useFhevmClient({
    provider,
    signer,
  });

  // Encryption hook
  const { encrypt, isEncrypting, error: encryptError } = useEncryptInput();

  // Decryption hook
  const { decrypt, isDecrypting, error: decryptError } = useDecryptOutput();

  const handleEncrypt = async () => {
    const result = await encrypt({
      values: [{ value: 42, type: 'euint32' }],
      contractAddress: '0x...',
      userAddress: address,
    });
    console.log('Encrypted:', result);
  };

  return (
    <div>
      {isInitialized ? '✓ Ready' : '⏳ Initializing...'}
      <button onClick={handleEncrypt} disabled={!isInitialized || isEncrypting}>
        {isEncrypting ? 'Encrypting...' : 'Encrypt'}
      </button>
    </div>
  );
}
```

## Encrypted Types

The SDK supports multiple encrypted types:

| Type | Description | Range |
|------|-------------|-------|
| `euint8` | 8-bit unsigned integer | 0 to 255 |
| `euint16` | 16-bit unsigned integer | 0 to 65,535 |
| `euint32` | 32-bit unsigned integer | 0 to 4,294,967,295 |
| `euint64` | 64-bit unsigned integer | 0 to 2^64 - 1 |
| `euint128` | 128-bit unsigned integer | 0 to 2^128 - 1 |
| `ebool` | Encrypted boolean | true or false |
| `eaddress` | Encrypted address | Ethereum address |

## Smart Contract Integration

### Solidity Side

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32 } from "@fhevm/solidity/lib/FHE.sol";

contract MyContract {
    euint32 private secretValue;

    // Receive encrypted input
    function setSecret(bytes32 encryptedValue, bytes calldata inputProof) public {
        secretValue = FHE.asEuint32(encryptedValue, inputProof);
        FHE.allowThis(secretValue);
    }

    // Allow user to decrypt
    function getSecret() public view returns (euint32) {
        FHE.allow(secretValue, msg.sender);
        return secretValue;
    }

    // Compute on encrypted data
    function addToSecret(bytes32 encryptedValue, bytes calldata inputProof) public {
        euint32 toAdd = FHE.asEuint32(encryptedValue, inputProof);
        secretValue = FHE.add(secretValue, toAdd);
    }
}
```

### Frontend Side

```typescript
// Encrypt and set secret
const encrypted = await encryptInput({
  values: [{ value: 42, type: 'euint32' }],
  contractAddress: contractAddress,
  userAddress: userAddress,
});
await contract.setSecret(encrypted.handles[0], encrypted.inputProof);

// Get and decrypt secret
const handle = await contract.getSecret();
const secret = await decryptOutput({
  handle: handle,
  contractAddress: contractAddress,
  userAddress: userAddress,
});
console.log('My secret:', secret);
```

## Configuration Options

```typescript
interface FhevmConfig {
  gatewayUrl?: string;      // Gateway URL (default: Zama gateway)
  aclAddress?: string;      // ACL contract address
  networkUrl?: string;      // Network RPC URL
  publicKey?: string;       // Public key for encryption
}

const client = createFhevmClient({
  provider,
  signer,
  config: {
    gatewayUrl: 'https://custom-gateway.example.com',
    // ... other options
  }
});
```

## Error Handling

```typescript
try {
  const encrypted = await encryptInput({ ... });
} catch (error) {
  if (error.code === 'ACTION_REJECTED') {
    console.log('User rejected the signature');
  } else if (error.code === 'NETWORK_ERROR') {
    console.log('Network connection failed');
  } else {
    console.error('Encryption failed:', error);
  }
}
```

## Best Practices

1. **Initialize Once**: Initialize FHEVM once at app startup, not on every operation
2. **Handle Loading States**: Show loading indicators during encryption/decryption
3. **Error Handling**: Always wrap encryption/decryption in try-catch blocks
4. **Permissions**: Remember that decryption requires contract permission via `FHE.allow()`
5. **Gas Optimization**: Batch multiple encrypted values in a single transaction when possible

## Next Steps

- [API Reference](./api-reference.md) - Complete API documentation
- [Examples](../examples/) - Working code examples
- [Deployment Guide](./deployment-guide.md) - Deploy your confidential dApp

## Common Issues

### "FHEVM not initialized" error

Make sure to call `initFhevm()` and wait for it to complete before performing any encryption or decryption.

### "Permission denied" during decryption

The smart contract must call `FHE.allow(handle, userAddress)` to grant decryption permission.

### Slow initialization

FHEVM initialization downloads encryption keys (~2-5 seconds). This is normal and only happens once per session.

## Support

- GitHub Issues: [Report a bug](https://github.com/zama-ai/fhevm/issues)
- Documentation: [docs.zama.ai](https://docs.zama.ai)
- Discord: [Join our community](https://discord.gg/zama)

## License

MIT
