import { LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useEffect, useState } from 'react';
import { getWeb3Instance, getContractInstance, getContractInstanceByAddress } from '../../utils/web3';
import { Link, useLoaderData } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Votier All Votes" },
    { name: "description", content: "List all votes!" },
  ];
};

export async function loader({
  params,
}: LoaderFunctionArgs) {
  return params;
}


export default function Votes() {
  const [votes, setVotes] = useState([]);
  const data = useLoaderData<typeof loader>();
  const votingContractAddress = data.address; 
  const [votesLoading, setVotesLoading] = useState(true);

  useEffect(() => {
    const fetchVoteEvents = async () => {
        const web3 = await getWeb3Instance();
        let contract;
        if(votingContractAddress != "" && votingContractAddress != undefined){
          contract = await getContractInstanceByAddress(web3, votingContractAddress);
        }
        else {
          contract = await getContractInstance(web3);
        }
        contract.getPastEvents('Voted', {
          fromBlock: 0,   // Starting block (can change based on your needs)
          toBlock: 'latest'  // You can specify the latest block or a specific block
      })
      .then(events => {
          setVotes(events);
          setVotesLoading(false);
      })
      .catch(err => {
          console.error('Error fetching past events:', err);
      });
    };

    fetchVoteEvents();
  }, []);

  return (
    <>
    <div style={{marginBottom: 20}} className="nav-buttons">
      <Link style={style.navButtonStyle} to={`/contracts`}>Create a New Contract</Link>
      <Link style={style.navButtonStyle} to={`/candidates/${votingContractAddress}`}>Candidates</Link>
      </div>
      <div className="votes-list">
      <div style={{ marginBottom:  20}}>
        <h1 style={{fontSize:32}} className="title">Votes ({votes.length})</h1>
      </div>
      {votes.length > 0 && votesLoading == false ? <>
        <ul style={{ marginBottom:  20}} className="candidate-items">
          {votes.map((vote, index) => (
            <div style={{border:'1px solid #555', borderRadius: 10, padding: 10, marginBottom: 10}} key={index}>
              <p>Address: {vote.address}</p>
              <p>Signature: {vote.signature}</p>
            </div>
          ))}
        </ul>
      </> : votesLoading == true ? <><span>...loading...</span></> : "No votes."}
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
