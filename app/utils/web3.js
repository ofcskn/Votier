import Web3, {net} from 'web3';
import VotierABI from "../../smart-contracts/build/contracts/Votier.json"; // Replace with actual path to ABI

export const getWeb3Instance = async () => {
  // Check if Web3 is injected (via MetaMask or other Ethereum provider)
  if (window.ethereum) {
    const web3 = new Web3("HTTP://127.0.0.1:8545");
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    return web3;
  } else {
    throw new Error('Ethereum browser extension not detected');
  }
};

// Get contract instance that is deployed by Truffle
export const getContractInstance = async (web3) => {
    const networkId = 5777;
  const deployedNetwork = VotierABI.networks[networkId];

  if (!deployedNetwork) {
    throw new Error('Smart contract not deployed to the detected network');
  }
  return new web3.eth.Contract(VotierABI.abi, deployedNetwork.address);
};


// Get contract instance using the contract address
export const getContractInstanceByAddress = async (web3, contractAddress) => {
  // Ensure the contract address is provided
  if (!contractAddress) {
    throw new Error('Contract address is required to get contract instance');
  }

  // Create the contract instance
  const contract = new web3.eth.Contract(VotierABI.abi, contractAddress);
  return contract;
};
