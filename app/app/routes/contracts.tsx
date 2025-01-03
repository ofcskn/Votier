import { type MetaFunction } from "@remix-run/node";
import { useEffect, useState } from 'react';
import { getWeb3Instance, getCreatedContractsByAdmin } from '../../utils/web3';
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
  const [currentAddress, setCurrentAddress] = useState([]); 
  const [endVotingDate, setEndVotingDate] = useState(""); 
  const [loading, setLoading] = useState(true); 

  const fetchContracts = async () => {
    const web3 = await getWeb3Instance();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setCurrentAddress(accounts[0]);
    // Use the current account to fetch contracts
    const contractsCreated = await getCreatedContractsByAdmin(web3, accounts[0]);
    setContracts(contractsCreated);
    setLoading(false);
  };

  useEffect(() => {
      fetchContracts();
  }, []); 



  const createContract = async () => {
    if (maxCandidatesCount == "" || maxCandidatesCount == null) {
      return ;
    }

    const web3 = await getWeb3Instance();

    // Get the user's account address (MetaMask)
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
  
    // Set up the contract
    const contract = new web3.eth.Contract(VotierABI);

    const endVotingTimestamp = new Date(endVotingDate).getTime();

    // Deploy the contract with the provided constructor parameter
    contract.deploy({
      data: bytecode,
      arguments: [maxCandidatesCount, endVotingTimestamp], // pass the constructor argument here
    })
    .send({
      from: account, // specify the sender address
      gas: "3000000",   // specify gas limit
    })
    .on('receipt', (receipt) => {
      console.log('Contract deployed at address:', receipt.contractAddress);
      fetchContracts();
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
        <h2>Your address is {currentAddress}</h2>
        <h3>Contracts are sorted by date.</h3>
      </div>
    <div>
      <input placeholder="End Voting Date" type="date" style={{background:'#fff', padding:"10px", height: 50, borderRadius: 16, color: '#000', marginRight: 10}} value={endVotingDate} onChange={e => setEndVotingDate(e.target.value)} />
      <input placeholder="Max Candidates" style={{background:'#fff', padding:"10px", height: 50, borderRadius: 16, color: '#000', marginRight: 10}} value={maxCandidatesCount} onChange={e => setMaxCandidatesCount(e.target.value)} />
      <button style={style.navButtonStyle} onClick={()=> createContract()}>Create a contract for {maxCandidatesCount} candidates</button>
    </div>
    {contracts.length > 0 && loading == false ? <>
      <ul style={{ marginTop:  20}} className="candidate-items">
        {contracts.map((contract, index) => (
          <div style={{border:'1px solid #555', borderRadius: 10, padding: 10, marginBottom: 10, display:'flex', justifyContent: 'space-between'}} key={index}>
            <Link to={`/candidates/${contract}`}>
              <p style={{fontSize: 32}}>{index + 1} - {contract}</p>
            </Link>
          </div>
        ))}
      </ul>
    </> : loading == true ? <><span>...loading...</span></> : "no contracts"}
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
