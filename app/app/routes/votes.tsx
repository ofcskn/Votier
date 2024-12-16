import { json, type MetaFunction } from "@remix-run/node";
import { useEffect, useState } from 'react';
import { getWeb3Instance, getContractInstance } from '../../utils/web3.js';
import Alert from '@mui/material/Alert';
import { Snackbar } from "@mui/material";

export const meta: MetaFunction = () => {
  return [
    { title: "Votier All Votes" },
    { name: "description", content: "List all votes!" },
  ];
};

export default function Votes() {
  const [votes, setVotes] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchVoteEvents = async () => {

        const web3 = await getWeb3Instance();
        const contract = await getContractInstance(web3);
        contract.getPastEvents('Voted', {
          fromBlock: 0,   // Starting block (can change based on your needs)
          toBlock: 'latest'  // You can specify the latest block or a specific block
      })
      .then(events => {
          console.log('Past events:', events);
          setVotes(events);
      })
      .catch(err => {
          console.error('Error fetching past events:', err);
      });
    };

    fetchVoteEvents();
  }, []);

  return (
    <>
      <div className="votes-list">
      <div style={{ marginBottom:  20}}>
        <h1 style={{fontSize:32}} className="title">Votes ({votes.length})</h1>
      </div>
      <ul style={{ marginBottom:  20}} className="candidate-items">
        {votes.map((vote, index) => (
          <div style={{border:'1px solid #555', borderRadius: 10, padding: 10, marginBottom: 10}} key={index}>
            <p>Address: {vote.address}</p>
            <p>Signature: {vote.signature}</p>
          </div>
        ))}
      </ul>
    </div>
    </>
  );
}
