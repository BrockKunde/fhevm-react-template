/**
 * FHEVM Initialization - Setup and configure FHEVM instance
 */

import { getFhevmClient } from './client';
import type { FhevmClient } from '../types';

/**
 * Initialize FHEVM instance with the client
 * This sets up the cryptographic context for encryption/decryption
 */
export async function initFhevm(client?: FhevmClient): Promise<void> {
  const fhevmClient = client || getFhevmClient();

  if (!fhevmClient) {
    throw new Error('FHEVM client not created. Call createFhevmClient() first.');
  }

  if (fhevmClient.isInitialized) {
    console.warn('FHEVM already initialized');
    return;
  }

  try {
    // Import fhevmjs dynamically to avoid bundling issues
    const { createInstance } = await import('fhevmjs');

    // Get chain ID for network-specific initialization
    const network = await fhevmClient.provider.getNetwork();
    const chainId = Number(network.chainId);

    // Create fhevmjs instance
    const instance = await createInstance({
      chainId,
      networkUrl: fhevmClient.config.gatewayUrl,
      aclAddress: fhevmClient.config.aclAddress,
      kmsVerifierAddress: fhevmClient.config.kmsVerifierAddress,
    });

    fhevmClient.instance = instance;
    fhevmClient.isInitialized = true;

    console.log('✅ FHEVM initialized successfully');
  } catch (error) {
    console.error('Failed to initialize FHEVM:', error);
    throw new Error(`FHEVM initialization failed: ${error}`);
  }
}

/**
 * Check if FHEVM is ready to use
 */
export function isFhevmReady(client?: FhevmClient): boolean {
  const fhevmClient = client || getFhevmClient();
  return fhevmClient?.isInitialized ?? false;
}

/**
 * Get the FHEVM instance
 */
export function getFhevmInstance(client?: FhevmClient): any {
  const fhevmClient = client || getFhevmClient();

  if (!fhevmClient?.isInitialized) {
    throw new Error('FHEVM not initialized. Call initFhevm() first.');
  }

  return fhevmClient.instance;
}
