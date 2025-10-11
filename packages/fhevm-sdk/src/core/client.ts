/**
 * FHEVM Client - Core client for managing FHEVM instance
 */

import type { FhevmClient, FhevmConfig, FhevmInitOptions } from '../types';
import { ethers } from 'ethers';

const DEFAULT_CONFIG: FhevmConfig = {
  network: 'sepolia',
  gatewayUrl: 'https://gateway.sepolia.fhevm.io',
  aclAddress: '0x...',  // Replace with actual ACL address
  kmsVerifierAddress: '0x...',  // Replace with actual KMS address
};

let globalClient: FhevmClient | null = null;

/**
 * Create a new FHEVM client instance
 * Wagmi-like API for client creation
 */
export function createFhevmClient(options: FhevmInitOptions): FhevmClient {
  const config: FhevmConfig = {
    ...DEFAULT_CONFIG,
    ...options.config,
  };

  const client: FhevmClient = {
    provider: options.provider,
    signer: options.signer,
    config,
    instance: null,
    isInitialized: false,
  };

  globalClient = client;
  return client;
}

/**
 * Get the current FHEVM client
 */
export function getFhevmClient(): FhevmClient | null {
  return globalClient;
}

/**
 * Check if client is initialized
 */
export function isClientInitialized(): boolean {
  return globalClient?.isInitialized ?? false;
}

/**
 * Reset the global client
 */
export function resetClient(): void {
  globalClient = null;
}

/**
 * Update client signer (useful for wallet changes)
 */
export function updateClientSigner(signer: ethers.Signer): void {
  if (globalClient) {
    globalClient.signer = signer;
  }
}
