# @fhevm/sdk

Universal FHEVM SDK for building confidential dApps with Fully Homomorphic Encryption.

## Features

✨ **Framework-Agnostic** - Works with React, Next.js, Vue, Node.js, or vanilla JavaScript
🔐 **Complete Encryption Suite** - Input encryption and output decryption with EIP-712 signatures
🎯 **Wagmi-like API** - Familiar, intuitive API structure for web3 developers
⚡ **Modular Design** - Use only what you need
🚀 **Zero Config** - Sensible defaults for quick setup
📦 **All-in-One Package** - Wraps all required dependencies

## Quick Start

### Installation

```bash
npm install @fhevm/sdk ethers
```

### Basic Usage (< 10 lines of code!)

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

## React Hooks

```tsx
import { useFhevmClient, useEncryptInput, useDecryptOutput } from '@fhevm/sdk/react';

function MyComponent() {
  const { client, isInitialized } = useFhevmClient({ provider, signer });
  const { encrypt, isEncrypting } = useEncryptInput();
  const { decrypt, isDecrypting } = useDecryptOutput();

  // Use encryption/decryption in your component
  const handleEncrypt = async () => {
    const result = await encrypt({
      values: [{ value: 42, type: 'euint32' }],
      contractAddress: '0x...',
      userAddress: address,
    });
  };

  return <div>{isInitialized ? 'Ready!' : 'Initializing...'}</div>;
}
```

## Documentation

- [Getting Started](../../docs/getting-started.md)
- [API Reference](../../docs/api-reference.md)
- [Examples](../../examples/)

## License

MIT
