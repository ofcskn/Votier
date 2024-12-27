import Web3, {net} from 'web3';
import VotierABI from "../../smart-contracts/build/contracts/Votier.json"; // Replace with actual path to ABI

export const getWeb3Instance = async () => {
  // Check if Web3 is injected (via MetaMask or other Ethereum provider)
  if (window.ethereum) {
    // Detect account changes and log the new account
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length > 0) {
        // console.log('New account detected:', accounts[0]);
        // You can add custom logic here to handle new accounts dynamically
      } else {
        // console.log('MetaMask is locked or no account connected.');
      }
    });

    // Create Web3 instance using the network provider
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

export const getCreatedContractsByAdmin = async (web3,adminAddress) =>  {
  if (adminAddress != null || adminAddress != "") {
    const latestBlock = await web3.eth.getBlockNumber();
    const createdContracts = [];
  
    for (let blockNumber = latestBlock; blockNumber >= 0; blockNumber--) {  
      const block = await web3.eth.getBlock(blockNumber, true); // Fetch transactions
      if (block && block.transactions) {
        for (const tx of block.transactions) {
          if (
            tx.from.toLowerCase() === adminAddress.toLowerCase() &&
            tx.to === null // Contract creation has `to` as null
          ) {
            // Fetch the receipt to get the contract address
            const receipt = await web3.eth.getTransactionReceipt(tx.hash);
            if (receipt && receipt.contractAddress) {
              createdContracts.push(receipt.contractAddress);
            }
          }
        }
      }
    }
    return createdContracts;
  }
}
