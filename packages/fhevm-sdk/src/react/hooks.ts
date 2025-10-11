/**
 * React Hooks for FHEVM SDK
 * Wagmi-like hooks for React applications
 */

import { useState, useEffect, useCallback } from 'react';
import { createFhevmClient, getFhevmClient } from '../core/client';
import { initFhevm, isFhevmReady } from '../core/init';
import { encryptInput, decryptOutput } from '../core/encryption';
import type {
  FhevmClient,
  FhevmInitOptions,
  EncryptInputOptions,
  EncryptedInput,
  DecryptOutputOptions,
  DecryptionResult,
} from '../types';

/**
 * Hook to initialize and manage FHEVM client
 */
export function useFhevmClient(options: FhevmInitOptions) {
  const [client, setClient] = useState<FhevmClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function initialize() {
      try {
        const newClient = createFhevmClient(options);
        await initFhevm(newClient);
        setClient(newClient);
        setIsInitialized(true);
      } catch (err) {
        setError(err as Error);
      }
    }

    initialize();
  }, [options.provider, options.signer]);

  return {
    client,
    isInitialized,
    error,
  };
}

/**
 * Hook for encrypting inputs
 */
export function useEncryptInput() {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const encrypt = useCallback(
    async (options: EncryptInputOptions): Promise<EncryptedInput | null> => {
      setIsEncrypting(true);
      setError(null);

      try {
        const result = await encryptInput(options);
        return result;
      } catch (err) {
        setError(err as Error);
        return null;
      } finally {
        setIsEncrypting(false);
      }
    },
    []
  );

  return {
    encrypt,
    isEncrypting,
    error,
  };
}

/**
 * Hook for decrypting outputs
 */
export function useDecryptOutput() {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const decrypt = useCallback(
    async (options: DecryptOutputOptions): Promise<DecryptionResult | null> => {
      setIsDecrypting(true);
      setError(null);

      try {
        const result = await decryptOutput(options);
        return result;
      } catch (err) {
        setError(err as Error);
        return null;
      } finally {
        setIsDecrypting(false);
      }
    },
    []
  );

  return {
    decrypt,
    isDecrypting,
    error,
  };
}

/**
 * Hook to check if FHEVM is ready
 */
export function useFhevmReady() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkReady = () => {
      setIsReady(isFhevmReady());
    };

    checkReady();
    const interval = setInterval(checkReady, 1000);

    return () => clearInterval(interval);
  }, []);

  return isReady;
}

/**
 * Hook for contract interactions with automatic encryption
 */
export function useFhevmContract(contractAddress: string, abi: any) {
  const client = getFhevmClient();
  const { encrypt } = useEncryptInput();
  const { decrypt } = useDecryptOutput();

  const writeEncrypted = useCallback(
    async (functionName: string, encryptedArgs: EncryptInputOptions) => {
      if (!client?.signer) {
        throw new Error('Signer not available');
      }

      const encrypted = await encrypt(encryptedArgs);
      if (!encrypted) {
        throw new Error('Encryption failed');
      }

      // Create contract instance
      const { ethers } = await import('ethers');
      const contract = new ethers.Contract(
        contractAddress,
        abi,
        client.signer
      );

      // Call contract function with encrypted data
      return contract[functionName](...encrypted.handles, encrypted.inputProof);
    },
    [client, contractAddress, abi, encrypt]
  );

  const readDecrypted = useCallback(
    async (
      functionName: string,
      decryptOptions: Omit<DecryptOutputOptions, 'contractAddress'>
    ) => {
      if (!client?.provider) {
        throw new Error('Provider not available');
      }

      // Create contract instance
      const { ethers } = await import('ethers');
      const contract = new ethers.Contract(
        contractAddress,
        abi,
        client.provider
      );

      // Read encrypted value from contract
      const encryptedValue = await contract[functionName]();

      // Decrypt the value
      return decrypt({
        ...decryptOptions,
        contractAddress,
        encryptedValue,
      });
    },
    [client, contractAddress, abi, decrypt]
  );

  return {
    writeEncrypted,
    readDecrypted,
  };
}
