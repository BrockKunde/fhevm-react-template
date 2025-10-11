/**
 * Utility functions for FHEVM SDK
 */

import type { FhevmType } from '../types';

/**
 * Convert FhevmType enum to bit size
 */
export function getTypeBitSize(type: FhevmType): number {
  switch (type) {
    case FhevmType.EUINT8:
    case FhevmType.EBOOL:
      return 8;
    case FhevmType.EUINT16:
      return 16;
    case FhevmType.EUINT32:
      return 32;
    case FhevmType.EUINT64:
      return 64;
    case FhevmType.EUINT128:
      return 128;
    default:
      throw new Error(`Unknown type: ${type}`);
  }
}

/**
 * Validate encrypted value format
 */
export function isValidEncryptedValue(value: string): boolean {
  return /^0x[a-fA-F0-9]+$/.test(value) && value.length > 2;
}

/**
 * Format error messages
 */
export function formatFhevmError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(
  txHash: string,
  provider: any,
  confirmations: number = 1
): Promise<any> {
  const receipt = await provider.waitForTransaction(txHash, confirmations);
  return receipt;
}
