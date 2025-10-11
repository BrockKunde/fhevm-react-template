# API Reference

Complete API documentation for the FHEVM SDK.

## Core API

### `createFhevmClient(options)`

Creates a new FHEVM client instance.

**Parameters:**

```typescript
interface FhevmInitOptions {
  provider: ethers.Provider;    // Ethereum provider
  signer?: ethers.Signer;       // Ethereum signer (required for encryption/decryption)
  config?: Partial<FhevmConfig>; // Optional configuration
}

interface FhevmConfig {
  gatewayUrl?: string;          // Gateway URL (default: Zama gateway)
  aclAddress?: string;          // ACL contract address
  networkUrl?: string;          // Network RPC URL
  publicKey?: string;           // Public key for encryption
}
```

**Returns:** `FhevmClient`

```typescript
interface FhevmClient {
  provider: ethers.Provider;
  signer?: ethers.Signer;
  config: FhevmConfig;
  instance: any;                // fhevmjs instance
  isInitialized: boolean;
}
```

**Example:**

```typescript
import { createFhevmClient } from '@fhevm/sdk';

const client = createFhevmClient({
  provider: new ethers.BrowserProvider(window.ethereum),
  signer: await provider.getSigner(),
  config: {
    gatewayUrl: 'https://gateway.zama.ai',
  }
});
```

---

### `initFhevm(client?)`

Initializes the FHEVM client by downloading encryption keys and setting up the instance.

**Parameters:**

- `client` (optional): `FhevmClient` - The client to initialize. If not provided, uses the global client.

**Returns:** `Promise<void>`

**Example:**

```typescript
import { initFhevm } from '@fhevm/sdk';

await initFhevm(client);
console.log('FHEVM initialized:', client.isInitialized); // true
```

**Notes:**

- Must be called before any encryption or decryption operations
- Downloads encryption keys (~2-5 seconds)
- Safe to call multiple times (will skip if already initialized)

---

### `encryptInput(options)`

Encrypts values for use in smart contract transactions.

**Parameters:**

```typescript
interface EncryptInputOptions {
  values: Array<{
    value: number | boolean | string;
    type: FhevmType;
  }>;
  contractAddress: string;      // Contract address
  userAddress: string;          // User address
}

enum FhevmType {
  EUINT8 = 'euint8',
  EUINT16 = 'euint16',
  EUINT32 = 'euint32',
  EUINT64 = 'euint64',
  EUINT128 = 'euint128',
  EBOOL = 'ebool',
  EADDRESS = 'eaddress',
}
```

**Returns:** `Promise<EncryptedInput>`

```typescript
interface EncryptedInput {
  handles: string[];            // Array of encrypted handles (one per value)
  inputProof: string;           // Proof for verification
}
```

**Example:**

```typescript
import { encryptInput } from '@fhevm/sdk';

const encrypted = await encryptInput({
  values: [
    { value: 100, type: 'euint32' },
    { value: true, type: 'ebool' },
  ],
  contractAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  userAddress: '0xYourAddress',
});

// Use in contract call
await contract.submit(
  encrypted.handles[0],
  encrypted.handles[1],
  encrypted.inputProof
);
```

**Errors:**

- Throws if FHEVM not initialized
- Throws if invalid value type
- Throws if invalid address format

---

### `decryptOutput(options)`

Decrypts an encrypted value from a smart contract.

**Parameters:**

```typescript
interface DecryptOutputOptions {
  handle: string;               // Encrypted handle from contract
  contractAddress: string;      // Contract address
  userAddress: string;          // User address
}
```

**Returns:** `Promise<number | boolean | string>`

The decrypted value type depends on the encrypted type:
- `euint*` → `number` or `bigint`
- `ebool` → `boolean`
- `eaddress` → `string`

**Example:**

```typescript
import { decryptOutput } from '@fhevm/sdk';

// Get encrypted handle from contract
const handle = await contract.getEncryptedValue();

// Decrypt it
const decrypted = await decryptOutput({
  handle: handle,
  contractAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  userAddress: '0xYourAddress',
});

console.log('Decrypted:', decrypted);
```

**Notes:**

- Requires EIP-712 signature from user
- Contract must have called `FHE.allow(handle, userAddress)` to grant permission
- May take 2-5 seconds to complete

**Errors:**

- Throws if FHEVM not initialized
- Throws if user doesn't have permission to decrypt
- Throws if handle is invalid

---

### `getGlobalClient()`

Gets the global FHEVM client instance.

**Returns:** `FhevmClient | null`

**Example:**

```typescript
import { getGlobalClient } from '@fhevm/sdk';

const client = getGlobalClient();
if (client && client.isInitialized) {
  console.log('FHEVM ready!');
}
```

---

## React Hooks

### `useFhevmClient(options)`

React hook for FHEVM client initialization.

**Parameters:**

```typescript
interface FhevmInitOptions {
  provider: ethers.Provider;
  signer?: ethers.Signer;
  config?: Partial<FhevmConfig>;
}
```

**Returns:**

```typescript
interface UseFhevmClientReturn {
  client: FhevmClient | null;
  isInitialized: boolean;
  error: Error | null;
}
```

**Example:**

```tsx
import { useFhevmClient } from '@fhevm/sdk/react';

function MyComponent() {
  const { client, isInitialized, error } = useFhevmClient({
    provider: provider,
    signer: signer,
  });

  if (error) return <div>Error: {error.message}</div>;
  if (!isInitialized) return <div>Initializing FHEVM...</div>;

  return <div>FHEVM Ready!</div>;
}
```

---

### `useEncryptInput()`

React hook for input encryption.

**Returns:**

```typescript
interface UseEncryptInputReturn {
  encrypt: (options: EncryptInputOptions) => Promise<EncryptedInput>;
  isEncrypting: boolean;
  error: Error | null;
}
```

**Example:**

```tsx
import { useEncryptInput } from '@fhevm/sdk/react';

function MyComponent() {
  const { encrypt, isEncrypting, error } = useEncryptInput();

  const handleEncrypt = async () => {
    const result = await encrypt({
      values: [{ value: 42, type: 'euint32' }],
      contractAddress: '0x...',
      userAddress: address,
    });
    console.log('Encrypted:', result);
  };

  return (
    <button onClick={handleEncrypt} disabled={isEncrypting}>
      {isEncrypting ? 'Encrypting...' : 'Encrypt'}
    </button>
  );
}
```

---

### `useDecryptOutput()`

React hook for output decryption.

**Returns:**

```typescript
interface UseDecryptOutputReturn {
  decrypt: (options: DecryptOutputOptions) => Promise<any>;
  isDecrypting: boolean;
  error: Error | null;
}
```

**Example:**

```tsx
import { useDecryptOutput } from '@fhevm/sdk/react';

function MyComponent() {
  const { decrypt, isDecrypting, error } = useDecryptOutput();
  const [value, setValue] = useState(null);

  const handleDecrypt = async () => {
    const handle = await contract.getValue();
    const decrypted = await decrypt({
      handle: handle,
      contractAddress: contractAddress,
      userAddress: userAddress,
    });
    setValue(decrypted);
  };

  return (
    <div>
      <button onClick={handleDecrypt} disabled={isDecrypting}>
        {isDecrypting ? 'Decrypting...' : 'Decrypt'}
      </button>
      {value !== null && <p>Value: {value}</p>}
    </div>
  );
}
```

---

### `useFhevmContract(options)`

React hook for creating an ethers contract instance with FHEVM client context.

**Parameters:**

```typescript
interface UseFhevmContractOptions {
  address: string;
  abi: any[];
  signer: ethers.Signer;
}
```

**Returns:**

```typescript
interface UseFhevmContractReturn {
  contract: ethers.Contract | null;
  isReady: boolean;
}
```

**Example:**

```tsx
import { useFhevmContract } from '@fhevm/sdk/react';

function MyComponent() {
  const { contract, isReady } = useFhevmContract({
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    abi: MY_CONTRACT_ABI,
    signer: signer,
  });

  const handleCall = async () => {
    if (contract) {
      const result = await contract.myFunction();
      console.log('Result:', result);
    }
  };

  return (
    <button onClick={handleCall} disabled={!isReady}>
      Call Contract
    </button>
  );
}
```

---

## Utility Functions

### `getTypeBitSize(type)`

Gets the bit size for an FHEVM type.

**Parameters:**

- `type`: `FhevmType` - The encrypted type

**Returns:** `number` - Bit size (8, 16, 32, 64, or 128)

**Example:**

```typescript
import { getTypeBitSize } from '@fhevm/sdk';

const size = getTypeBitSize('euint32'); // 32
```

---

### `isValidEncryptedValue(value)`

Validates an encrypted value format.

**Parameters:**

- `value`: `string` - The encrypted value to validate

**Returns:** `boolean` - True if valid hex string

**Example:**

```typescript
import { isValidEncryptedValue } from '@fhevm/sdk';

const isValid = isValidEncryptedValue('0x1234abcd'); // true
const isInvalid = isValidEncryptedValue('not-hex'); // false
```

---

### `formatFhevmError(error)`

Formats an error message for display.

**Parameters:**

- `error`: `unknown` - The error to format

**Returns:** `string` - Formatted error message

**Example:**

```typescript
import { formatFhevmError } from '@fhevm/sdk';

try {
  await encryptInput(...);
} catch (error) {
  const message = formatFhevmError(error);
  alert(message);
}
```

---

## TypeScript Types

### `FhevmType`

```typescript
enum FhevmType {
  EUINT8 = 'euint8',
  EUINT16 = 'euint16',
  EUINT32 = 'euint32',
  EUINT64 = 'euint64',
  EUINT128 = 'euint128',
  EBOOL = 'ebool',
  EADDRESS = 'eaddress',
}
```

### `FhevmClient`

```typescript
interface FhevmClient {
  provider: ethers.Provider;
  signer?: ethers.Signer;
  config: FhevmConfig;
  instance: any;
  isInitialized: boolean;
}
```

### `FhevmConfig`

```typescript
interface FhevmConfig {
  gatewayUrl: string;
  aclAddress?: string;
  networkUrl?: string;
  publicKey?: string;
}
```

### `EncryptedInput`

```typescript
interface EncryptedInput {
  handles: string[];
  inputProof: string;
}
```

---

## Error Codes

Common error codes you may encounter:

| Code | Description |
|------|-------------|
| `FHEVM_NOT_INITIALIZED` | FHEVM client not initialized |
| `INVALID_VALUE` | Invalid value for encryption |
| `INVALID_TYPE` | Invalid FHEVM type |
| `INVALID_ADDRESS` | Invalid Ethereum address |
| `PERMISSION_DENIED` | No permission to decrypt |
| `NETWORK_ERROR` | Network connection failed |
| `ACTION_REJECTED` | User rejected signature |
| `GATEWAY_ERROR` | Gateway service error |

---

## Constants

### Default Configuration

```typescript
const DEFAULT_CONFIG: FhevmConfig = {
  gatewayUrl: 'https://gateway.zama.ai',
};
```

### Supported Types

```typescript
const SUPPORTED_TYPES = [
  'euint8',
  'euint16',
  'euint32',
  'euint64',
  'euint128',
  'ebool',
  'eaddress',
];
```

---

## Advanced Usage

### Custom Gateway

```typescript
const client = createFhevmClient({
  provider,
  signer,
  config: {
    gatewayUrl: 'https://my-custom-gateway.example.com',
    aclAddress: '0xCustomACLAddress',
  }
});
```

### Batch Operations

```typescript
// Encrypt multiple values at once
const encrypted = await encryptInput({
  values: [
    { value: 100, type: 'euint32' },
    { value: 200, type: 'euint32' },
    { value: true, type: 'ebool' },
  ],
  contractAddress: contractAddress,
  userAddress: userAddress,
});

// All handles share the same proof
await contract.batchSubmit(
  encrypted.handles[0],
  encrypted.handles[1],
  encrypted.handles[2],
  encrypted.inputProof
);
```

### Manual Client Management

```typescript
import { createFhevmClient, initFhevm, getGlobalClient } from '@fhevm/sdk';

// Create and initialize manually
const client = createFhevmClient({ provider, signer });
await initFhevm(client);

// Use global client in other parts of your app
const globalClient = getGlobalClient();
console.log('Is initialized:', globalClient?.isInitialized);
```

---

## Browser vs Node.js

The SDK works in both browser and Node.js environments:

### Browser

```typescript
import { ethers } from 'ethers';
import { createFhevmClient, initFhevm } from '@fhevm/sdk';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const client = createFhevmClient({ provider, signer });
await initFhevm(client);
```

### Node.js

```typescript
import { ethers } from 'ethers';
import { createFhevmClient, initFhevm } from '@fhevm/sdk';

const provider = new ethers.JsonRpcProvider('https://rpc.zama.ai');
const wallet = new ethers.Wallet(privateKey, provider);
const client = createFhevmClient({ provider, signer: wallet });
await initFhevm(client);
```

---

## Migration Guide

### From fhevmjs

```typescript
// Old (fhevmjs)
import { createInstance } from 'fhevmjs';
const instance = await createInstance({
  chainId: 8009,
  networkUrl: 'https://devnet.zama.ai',
});

// New (@fhevm/sdk)
import { createFhevmClient, initFhevm } from '@fhevm/sdk';
const client = createFhevmClient({ provider, signer });
await initFhevm(client);
```

---

## Support

For issues, questions, or contributions:

- GitHub: [github.com/zama-ai/fhevm](https://github.com/zama-ai/fhevm)
- Documentation: [docs.zama.ai](https://docs.zama.ai)
- Discord: [discord.gg/zama](https://discord.gg/zama)

## License

MIT
