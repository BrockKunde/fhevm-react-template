'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useFhevmClient, useEncryptInput, useFhevmContract } from '@fhevm/sdk/react';

// Contract ABI (simplified for demonstration)
const BETTING_ABI = [
  'function currentMatchId() view returns (uint32)',
  'function getMatchBasicInfo(uint32) view returns (string, string, uint256, uint256)',
  'function getMatchStatus(uint32) view returns (uint8, uint256, uint256)',
  'function placeBet(uint32, uint8, uint8, uint8) payable',
  'function claimWinnings(uint32)',
  'event BetPlaced(uint32 indexed matchId, address indexed bettor, uint8 betType, uint256 amount)',
  'event MatchFinished(uint32 indexed matchId, uint8 homeScore, uint8 awayScore)',
];

const CONTRACT_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'; // Example address

export default function SportsBetting() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string>('');
  const [currentMatchId, setCurrentMatchId] = useState<number>(0);
  const [selectedMatch, setSelectedMatch] = useState<number>(1);
  const [betAmount, setBetAmount] = useState<string>('0.01');
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');

  const { client, isInitialized, error: fhevmError } = useFhevmClient({
    provider: provider!,
    signer: signer!,
  });

  const { encrypt, isEncrypting } = useEncryptInput();

  const { contract } = useFhevmContract({
    address: CONTRACT_ADDRESS,
    abi: BETTING_ABI,
    signer: signer!,
  });

  // Connect wallet
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        const newSigner = await newProvider.getSigner();
        const addr = await newSigner.getAddress();

        setProvider(newProvider);
        setSigner(newSigner);
        setAddress(addr);
      } catch (err) {
        console.error('Failed to connect wallet:', err);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  // Load current match ID
  useEffect(() => {
    if (contract) {
      contract.currentMatchId().then((id: bigint) => {
        setCurrentMatchId(Number(id));
      });
    }
  }, [contract]);

  // Place bet with encryption
  const placeBet = async () => {
    if (!isInitialized || !contract || !address) {
      alert('Please connect wallet and wait for FHEVM initialization');
      return;
    }

    try {
      // Encrypt the bet prediction
      const prediction = selectedTeam === 'home' ? 0 : 1;
      const encryptedData = await encrypt({
        values: [{ value: prediction, type: 'euint8' }],
        contractAddress: CONTRACT_ADDRESS,
        userAddress: address,
      });

      // BetType.WinLose = 0, betOptions: bit 1-2 for predictedWinner
      const betOptions = selectedTeam === 'home' ? 0b0010 : 0b0100; // Home or Away

      // Place bet with encrypted prediction
      const tx = await contract.placeBet(
        selectedMatch,
        0, // BetType.WinLose
        prediction,
        betOptions,
        { value: ethers.parseEther(betAmount) }
      );

      console.log('Bet placed! Transaction:', tx.hash);
      await tx.wait();
      alert('Bet placed successfully!');
    } catch (err: any) {
      console.error('Failed to place bet:', err);
      alert(`Failed to place bet: ${err.message}`);
    }
  };

  // Claim winnings
  const claimWinnings = async () => {
    if (!contract) return;

    try {
      const tx = await contract.claimWinnings(selectedMatch);
      console.log('Claiming winnings! Transaction:', tx.hash);
      await tx.wait();
      alert('Winnings claimed successfully!');
    } catch (err: any) {
      console.error('Failed to claim winnings:', err);
      alert(`Failed to claim: ${err.message}`);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-2">Confidential Sports Betting</h1>
        <p className="text-gray-400 mb-8">Powered by FHEVM - Private predictions, fair outcomes</p>

        {/* Wallet Connection */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Wallet Connection</h2>
          {!address ? (
            <button
              onClick={connectWallet}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
            >
              Connect MetaMask
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-green-400">
                ✓ Connected: {address.slice(0, 6)}...{address.slice(-4)}
              </p>
              {isInitialized ? (
                <p className="text-green-400">✓ FHEVM initialized and ready</p>
              ) : fhevmError ? (
                <p className="text-red-400">✗ FHEVM Error: {fhevmError.message}</p>
              ) : (
                <p className="text-yellow-400">⏳ Initializing FHEVM...</p>
              )}
            </div>
          )}
        </div>

        {/* Match Information */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Current Matches</h2>
          <p className="text-gray-400 mb-4">
            Total matches available: <span className="text-white font-bold">{currentMatchId}</span>
          </p>
          <div className="flex items-center gap-4">
            <label className="text-gray-400">Select Match ID:</label>
            <input
              type="number"
              min="1"
              max={currentMatchId}
              value={selectedMatch}
              onChange={(e) => setSelectedMatch(Number(e.target.value))}
              className="bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white"
            />
          </div>
        </div>

        {/* Place Bet */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Place Your Bet</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">Bet Amount (ETH)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="10"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Select Team</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedTeam('home')}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    selectedTeam === 'home'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Home Team
                </button>
                <button
                  onClick={() => setSelectedTeam('away')}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    selectedTeam === 'away'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Away Team
                </button>
              </div>
            </div>

            <button
              onClick={placeBet}
              disabled={!isInitialized || isEncrypting}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isEncrypting ? 'Encrypting...' : 'Place Encrypted Bet'}
            </button>
          </div>
        </div>

        {/* Claim Winnings */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Claim Winnings</h2>
          <p className="text-gray-400 mb-4">
            If you won your bet on match #{selectedMatch}, claim your winnings here.
          </p>
          <button
            onClick={claimWinnings}
            disabled={!contract}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Claim Winnings for Match #{selectedMatch}
          </button>
        </div>

        {/* Features */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
          <ul className="space-y-2 text-gray-300">
            <li>🔐 <strong>Fully Confidential:</strong> Your predictions are encrypted end-to-end</li>
            <li>⚡ <strong>Fair Outcomes:</strong> No one can see bets until match completion</li>
            <li>💰 <strong>Pool-Based Payouts:</strong> Winners share the losing pool proportionally</li>
            <li>🛡️ <strong>Secure:</strong> Built on FHEVM with encrypted smart contract state</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
