/**
 * FHEVM Encryption/Decryption utilities
 * Handles input encryption and output decryption with EIP-712 signatures
 */

import { getFhevmInstance } from './init';
import { getFhevmClient } from './client';
import type {
  EncryptInputOptions,
  EncryptedInput,
  DecryptOutputOptions,
  DecryptionResult,
  FhevmType,
} from '../types';

/**
 * Encrypt input values for contract function calls
 * Returns handles and input proof for transaction
 */
export async function encryptInput(
  options: EncryptInputOptions
): Promise<EncryptedInput> {
  const instance = getFhevmInstance();
  const client = getFhevmClient();

  if (!client?.signer) {
    throw new Error('Signer required for encryption. Set signer in client.');
  }

  try {
    // Create encrypted input using fhevmjs
    const input = instance.createEncryptedInput(
      options.contractAddress,
      options.userAddress
    );

    // Add each value with its type
    for (const { value, type } of options.values) {
      switch (type) {
        case FhevmType.EUINT8:
          input.add8(value);
          break;
        case FhevmType.EUINT16:
          input.add16(value);
          break;
        case FhevmType.EUINT32:
          input.add32(value);
          break;
        case FhevmType.EUINT64:
          input.add64(value);
          break;
        case FhevmType.EUINT128:
          input.add128(value);
          break;
        case FhevmType.EBOOL:
          input.addBool(value);
          break;
        default:
          throw new Error(`Unsupported type: ${type}`);
      }
    }

    // Encrypt and get proof
    const encryptedData = input.encrypt();

    return {
      handles: encryptedData.handles,
      inputProof: encryptedData.inputProof,
    };
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error(`Failed to encrypt input: ${error}`);
  }
}

/**
 * Decrypt output using user-specific decryption with EIP-712 signature
 * This is the recommended method for user privacy
 */
export async function decryptOutput(
  options: DecryptOutputOptions
): Promise<DecryptionResult> {
  const instance = getFhevmInstance();
  const client = getFhevmClient();

  if (!client?.signer) {
    throw new Error('Signer required for decryption');
  }

  try {
    let plaintext: string | number | boolean;

    if (options.useUserDecrypt !== false) {
      // User-specific decryption with EIP-712 signature
      const userAddress = await client.signer.getAddress();

      // Request decryption signature
      const { signature, publicKey } = await instance.requestDecryption(
        options.encryptedValue,
        options.contractAddress,
        userAddress
      );

      // Sign with EIP-712
      const eip712Signature = await client.signer.signTypedData(
        signature.domain,
        signature.types,
        signature.message
      );

      // Decrypt with signature
      plaintext = await instance.decrypt(
        options.encryptedValue,
        eip712Signature,
        publicKey
      );
    } else {
      // Public decryption (no signature required)
      plaintext = await instance.publicDecrypt(
        options.encryptedValue,
        options.contractAddress
      );
    }

    return {
      plaintext,
      success: true,
    };
  } catch (error) {
    console.error('Decryption failed:', error);
    return {
      plaintext: '',
      success: false,
    };
  }
}

/**
 * Batch encrypt multiple inputs
 */
export async function batchEncryptInputs(
  inputs: EncryptInputOptions[]
): Promise<EncryptedInput[]> {
  return Promise.all(inputs.map(encryptInput));
}

/**
 * Batch decrypt multiple outputs
 */
export async function batchDecryptOutputs(
  outputs: DecryptOutputOptions[]
): Promise<DecryptionResult[]> {
  return Promise.all(outputs.map(decryptOutput));
}

/**
 * Reencrypt value for specific address (permission management)
 */
export async function reencryptValue(
  encryptedValue: string,
  contractAddress: string,
  targetAddress: string
): Promise<string> {
  const instance = getFhevmInstance();

  try {
    return await instance.reencrypt(
      encryptedValue,
      contractAddress,
      targetAddress
    );
  } catch (error) {
    console.error('Reencryption failed:', error);
    throw new Error(`Failed to reencrypt value: ${error}`);
  }
}
