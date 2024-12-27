import { type MetaFunction } from "@remix-run/node";
import { useEffect, useState } from 'react';
import { getWeb3Instance, getContractInstance } from '../../utils/web3.js';
import { abi as VotierABI, bytecode } from '../../../smart-contracts/build/contracts/Votier.json';
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Create Contract" },
    { name: "description", content: "Create a new smart contract!" },
  ];
};

export default function Contracts() {
  const [maxCandidatesCount, setMaxCandidatesCount] = useState(""); 
  const [contracts, setContracts] = useState([]); 

  useEffect(() => {
    const fetchContracts = async () => {
        const web3 = await getWeb3Instance();
        const contract = await getContractInstance(web3);
        const events = await contract.getPastEvents("ContractDeployed", {
            fromBlock: 0,
            toBlock: "latest"
        });
        console.log(events);
  
        const deployedContracts = events.map(event => ({
            creator: event.returnValues.creator,
            contractAddress: event.returnValues.contractAddress
        }));

    
    };

    fetchContracts();
  }, []);


  const createContract = async () => {
    const web3 = await getWeb3Instance();

    // Get the user's account address (MetaMask)
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
  
    // Set up the contract
    const contract = new web3.eth.Contract(VotierABI);

    // Deploy the contract with the provided constructor parameter
    contract.deploy({
      data: bytecode,
      arguments: [maxCandidatesCount], // pass the constructor argument here
    })
    .send({
      from: account, // specify the sender address
      gas: "3000000",   // specify gas limit
    })
    .on('receipt', (receipt) => {
      console.log(receipt);
      console.log('Contract deployed at address:', receipt.contractAddress);
    })
    .on('error', (error) => {
      console.error('Error deploying contract:', error);
    });
  }

  return (
    <>
   <div style={{marginBottom: 20}} className="nav-buttons">
      <Link style={style.navButtonStyle} to={`/`}>Home</Link>
      </div>
    <div>
    <div style={{ marginBottom:  20}}>
        <h1 style={{fontSize:32}} className="title">Contracts List ({contracts.length})</h1>
      </div>
    <ul style={{ marginBottom:  20}} className="candidate-items">
        {contracts.map((contract, index) => (
          <div style={{border:'1px solid #555', borderRadius: 10, padding: 10, marginBottom: 10, display:'flex', justifyContent: 'space-between'}} key={index}>
            <Link to={`/candidates/${contract.address}`}>
              <p style={{fontSize: 32}}>{contract.address}</p>
            </Link>
          </div>
        ))}
      </ul>
    </div>
    <div>
      <input placeholder="Max Candidates" style={{background:'#fff', padding:"10px", height: 50, borderRadius: 16, color: '#000', marginRight: 10}} value={maxCandidatesCount} onChange={e => setMaxCandidatesCount(e.target.value)} />
      <button style={style.navButtonStyle} onClick={()=> createContract()}>Create a contract for {maxCandidatesCount} candidates</button>
    </div>
    </>
  );
}

const style = {
  navButtonStyle: {
    background: '#fff',
    padding: '10px',
    color: '#000',
    marginRight: 10,
    borderRadius: 10
  }
}
