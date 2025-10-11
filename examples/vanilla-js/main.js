import { createFhevmClient, initFhevm, encryptInput, decryptOutput } from '@fhevm/sdk';
import { ethers } from 'ethers';

// Global state
let client = null;
let provider = null;
let signer = null;
let userAddress = null;

// DOM elements
const connectBtn = document.getElementById('connectBtn');
const walletStatus = document.getElementById('walletStatus');
const fhevmStatus = document.getElementById('fhevmStatus');
const encryptBtn = document.getElementById('encryptBtn');
const encryptResult = document.getElementById('encryptResult');
const decryptBtn = document.getElementById('decryptBtn');
const decryptResult = document.getElementById('decryptResult');
const valueInput = document.getElementById('valueInput');
const typeSelect = document.getElementById('typeSelect');
const contractAddress = document.getElementById('contractAddress');
const handleInput = document.getElementById('handleInput');

// Utility function to create status message
function createStatus(message, type = 'pending') {
  return `<div class="status ${type}">${message}</div>`;
}

// Connect wallet
connectBtn.addEventListener('click', async () => {
  try {
    if (typeof window.ethereum === 'undefined') {
      walletStatus.innerHTML = createStatus('Please install MetaMask!', 'error');
      return;
    }

    connectBtn.disabled = true;
    connectBtn.textContent = 'Connecting...';
    walletStatus.innerHTML = createStatus('Connecting to MetaMask...', 'pending');

    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Create provider and signer
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    userAddress = await signer.getAddress();

    walletStatus.innerHTML = createStatus(
      `✓ Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`,
      'success'
    );
    connectBtn.textContent = 'Connected';

    // Initialize FHEVM
    await initializeFhevm();
  } catch (error) {
    console.error('Connection error:', error);
    walletStatus.innerHTML = createStatus(`Error: ${error.message}`, 'error');
    connectBtn.disabled = false;
    connectBtn.textContent = 'Connect MetaMask';
  }
});

// Initialize FHEVM
async function initializeFhevm() {
  try {
    fhevmStatus.innerHTML = createStatus('⏳ Initializing FHEVM...', 'pending');

    // Create FHEVM client
    client = createFhevmClient({ provider, signer });

    // Initialize FHEVM
    await initFhevm(client);

    fhevmStatus.innerHTML = createStatus('✓ FHEVM initialized and ready!', 'success');

    // Enable encryption/decryption buttons
    encryptBtn.disabled = false;
    decryptBtn.disabled = false;
  } catch (error) {
    console.error('FHEVM initialization error:', error);
    fhevmStatus.innerHTML = createStatus(`Error: ${error.message}`, 'error');
  }
}

// Encrypt value
encryptBtn.addEventListener('click', async () => {
  try {
    if (!client || !client.isInitialized) {
      encryptResult.innerHTML = createStatus('Please connect wallet and initialize FHEVM first', 'error');
      return;
    }

    const value = parseInt(valueInput.value);
    const type = typeSelect.value;
    const contractAddr = contractAddress.value;

    if (isNaN(value)) {
      encryptResult.innerHTML = createStatus('Please enter a valid number', 'error');
      return;
    }

    if (!contractAddr || !contractAddr.startsWith('0x')) {
      encryptResult.innerHTML = createStatus('Please enter a valid contract address', 'error');
      return;
    }

    encryptBtn.disabled = true;
    encryptBtn.textContent = 'Encrypting...';
    encryptResult.innerHTML = createStatus('⏳ Encrypting value...', 'pending');

    // Encrypt the input
    const encrypted = await encryptInput({
      values: [{ value, type }],
      contractAddress: contractAddr,
      userAddress: userAddress,
    });

    encryptResult.innerHTML = `
      ${createStatus('✓ Encryption successful!', 'success')}
      <div class="result-box">
        <strong>Encrypted Handle:</strong><br>
        ${encrypted.handles[0]}<br><br>
        <strong>Input Proof:</strong><br>
        ${encrypted.inputProof.substring(0, 100)}...
      </div>
      <div class="info-box">
        <strong>Usage:</strong> Pass <code>encrypted.handles[0]</code> and <code>encrypted.inputProof</code>
        to your smart contract function. The contract can then operate on the encrypted value without seeing it!
      </div>
    `;

    encryptBtn.disabled = false;
    encryptBtn.textContent = 'Encrypt Value';
  } catch (error) {
    console.error('Encryption error:', error);
    encryptResult.innerHTML = createStatus(`Error: ${error.message}`, 'error');
    encryptBtn.disabled = false;
    encryptBtn.textContent = 'Encrypt Value';
  }
});

// Decrypt value
decryptBtn.addEventListener('click', async () => {
  try {
    if (!client || !client.isInitialized) {
      decryptResult.innerHTML = createStatus('Please connect wallet and initialize FHEVM first', 'error');
      return;
    }

    const handle = handleInput.value.trim();
    const contractAddr = contractAddress.value;

    if (!handle || !handle.startsWith('0x')) {
      decryptResult.innerHTML = createStatus('Please enter a valid encrypted handle', 'error');
      return;
    }

    if (!contractAddr || !contractAddr.startsWith('0x')) {
      decryptResult.innerHTML = createStatus('Please enter a valid contract address', 'error');
      return;
    }

    decryptBtn.disabled = true;
    decryptBtn.textContent = 'Decrypting...';
    decryptResult.innerHTML = createStatus('⏳ Requesting decryption signature...', 'pending');

    // Decrypt the output
    const decrypted = await decryptOutput({
      handle: handle,
      contractAddress: contractAddr,
      userAddress: userAddress,
    });

    decryptResult.innerHTML = `
      ${createStatus('✓ Decryption successful!', 'success')}
      <div class="result-box">
        <strong>Decrypted Value:</strong><br>
        ${decrypted}
      </div>
      <div class="info-box">
        <strong>Note:</strong> Decryption requires proper permissions. The contract must have called
        <code>FHE.allow(handle, userAddress)</code> to grant you access to this encrypted value.
      </div>
    `;

    decryptBtn.disabled = false;
    decryptBtn.textContent = 'Decrypt Value';
  } catch (error) {
    console.error('Decryption error:', error);
    decryptResult.innerHTML = createStatus(
      `Error: ${error.message}. Make sure you have permission to decrypt this value.`,
      'error'
    );
    decryptBtn.disabled = false;
    decryptBtn.textContent = 'Decrypt Value';
  }
});

// Initialize UI
encryptBtn.disabled = true;
decryptBtn.disabled = true;
fhevmStatus.innerHTML = createStatus('Connect wallet to initialize FHEVM', 'pending');
