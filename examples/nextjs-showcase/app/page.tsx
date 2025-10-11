'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useFhevmClient, useEncryptInput, useDecryptOutput } from '@fhevm/sdk/react';

export default function Home() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string>('');

  const { client, isInitialized, error } = useFhevmClient({
    provider: provider!,
    signer: signer!,
  });

  const { encrypt, isEncrypting } = useEncryptInput();
  const { decrypt, isDecrypting } = useDecryptOutput();

  // Connect wallet
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      const newSigner = await newProvider.getSigner();
      const addr = await newSigner.getAddress();

      setProvider(newProvider);
      setSigner(newSigner);
      setAddress(addr);
    }
  };

  return (
    <main className="min-h-screen p-24">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">FHEVM SDK Showcase</h1>

        {/* Wallet Connection */}
        <div className="mb-8 p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">1. Connect Wallet</h2>
          {!address ? (
            <button
              onClick={connectWallet}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Connect MetaMask
            </button>
          ) : (
            <p className="text-green-600">
              ✓ Connected: {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          )}
        </div>

        {/* FHEVM Status */}
        <div className="mb-8 p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">2. FHEVM Status</h2>
          {isInitialized ? (
            <p className="text-green-600">✓ FHEVM initialized and ready</p>
          ) : error ? (
            <p className="text-red-600">✗ Error: {error.message}</p>
          ) : (
            <p className="text-yellow-600">⏳ Initializing FHEVM...</p>
          )}
        </div>

        {/* Encryption Example */}
        <div className="mb-8 p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">3. Encrypt Input</h2>
          <button
            onClick={async () => {
              if (!isInitialized || !address) return;

              const result = await encrypt({
                values: [{ value: 100, type: 'euint32' }],
                contractAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
                userAddress: address,
              });

              console.log('Encrypted:', result);
            }}
            disabled={!isInitialized || isEncrypting}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {isEncrypting ? 'Encrypting...' : 'Encrypt Value (100)'}
          </button>
        </div>

        {/* Examples List */}
        <div className="mb-8 p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Example dApps</h2>
          <ul className="space-y-2">
            <li>
              <a href="/examples/sports-betting" className="text-blue-600 hover:underline">
                → Confidential Sports Betting
              </a>
            </li>
            <li>
              <a href="/examples/vanilla" className="text-blue-600 hover:underline">
                → Vanilla JavaScript Example
              </a>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
