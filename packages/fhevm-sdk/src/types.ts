/**
 * Core types for FHEVM SDK
 */

import type { ethers } from 'ethers';

export interface FhevmConfig {
  network: 'sepolia' | 'mainnet' | 'localhost';
  gatewayUrl?: string;
  aclAddress?: string;
  kmsVerifierAddress?: string;
}

export interface FhevmClient {
  provider: ethers.Provider;
  signer?: ethers.Signer;
  config: FhevmConfig;
  instance: any; // fhevmjs instance
  isInitialized: boolean;
}

export interface EncryptedInput {
  handles: string[];
  inputProof: string;
}

export interface DecryptRequest {
  contractAddress: string;
  encryptedValue: string;
  type: FhevmType;
  userAddress?: string;
}

export enum FhevmType {
  EUINT8 = 'euint8',
  EUINT16 = 'euint16',
  EUINT32 = 'euint32',
  EUINT64 = 'euint64',
  EUINT128 = 'euint128',
  EBOOL = 'ebool',
  EADDRESS = 'eaddress',
}

export interface EncryptionResult {
  ciphertext: Uint8Array;
  signature: string;
}

export interface DecryptionResult {
  plaintext: string | number | boolean;
  success: boolean;
}

export type FhevmInitOptions = {
  provider: ethers.Provider;
  signer?: ethers.Signer;
  config?: Partial<FhevmConfig>;
};

export type EncryptInputOptions = {
  values: Array<{ value: number | boolean; type: FhevmType }>;
  contractAddress: string;
  userAddress: string;
};

export type DecryptOutputOptions = {
  encryptedValue: string;
  contractAddress: string;
  type: FhevmType;
  useUserDecrypt?: boolean; // EIP-712 signature method
};
