/**
 * @fhevm/sdk - Universal FHEVM SDK
 *
 * A framework-agnostic SDK for building confidential dApps with FHE encryption.
 * Provides wagmi-like API structure with modular utilities for:
 * - Initialization
 * - Input encryption
 * - Output decryption (userDecrypt with EIP-712 + publicDecrypt)
 * - Contract interactions
 */

export * from './core';
export * from './types';
export * from './utils';

// Default export for convenience
export { createFhevmClient } from './core/client';
export { encryptInput, decryptOutput } from './core/encryption';
export { initFhevm } from './core/init';
