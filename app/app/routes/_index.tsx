import { json, type MetaFunction } from "@remix-run/node";
import { useEffect, useState } from 'react';
import { getWeb3Instance, getContractInstance } from '../../utils/web3.js';

export const meta: MetaFunction = () => {
  return [
    { title: "Votier App" },
    { name: "description", content: "Welcome to Votier!" },
  ];
};

export default function Index() {
  const [candidateName, setCandidateName] = useState("");
  const [candidates, setCandidates] = useState([]);

  const addCandidate = async ()=> {
      try {
        const web3 = await getWeb3Instance();
        const contract = await getContractInstance(web3);

        const accounts = await web3.eth.getAccounts();
        const candidateData = await contract.methods.addCandidate(candidateName).send({ from: accounts[0], gas: 300000});
        const candidateCountData = await contract.methods.getAllCandidates().call();
        setCandidates(candidateCountData);
      } catch (error) {
        console.error('Error adding a new candidate:', error);
      }
  }
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const web3 = await getWeb3Instance();
        const contract = await getContractInstance(web3);
        const candidateData = await contract.methods.getAllCandidates().call();
        setCandidates(candidateData);
      } catch (error) {
        console.error('Error fetching candidates:', error);
      }
    };

    fetchCandidates();
  }, []);

  return (
    
    <div className="candidate-list">
      <h2 className="title">Candidate List ({candidates.length})</h2>
      <ul className="candidate-items">
        {candidates.map((candidate, index) => (
          <li key={index}>
            <p>{candidate.name}</p>
            <span>{candidate.voteCount}</span>
          </li>
        ))}
      </ul>
      <input value={candidateName} onChange={e => setCandidateName(e.target.value)} />
      <button onClick={addCandidate}>Add Candidate</button>
    </div>
  );
}
