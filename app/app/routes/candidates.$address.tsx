import { json, LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useEffect, useState } from 'react';
import { getWeb3Instance, getContractInstanceByAddress } from '../../utils/web3';
import Alert from '@mui/material/Alert';
import { Snackbar } from "@mui/material";
import { Link, useLoaderData } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Votier App" },
    { name: "description", content: "Welcome to Votier!" },
  ];
};

export async function loader({
  params,
}: LoaderFunctionArgs) {
  return params;
}

export default function Candidates() {
  const [errorText, setErrorText] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(true);
  const [winner, setWinner] = useState("");
  const [open, setOpen] = useState(false);
  const [maxCandidatesCount, setMaxCandidatesCount] = useState("");
  const [tieBreakerStatus, setTieBreakerStatus] = useState(false);
  
  const data = useLoaderData<typeof loader>();
  const votingContractAddress = data.address; 

  const fetchTieBreakerStatus = async () =>  {
    try {
      const web3 = await getWeb3Instance();
      const contract = await getContractInstanceByAddress(web3, data.address);
      const isTieBreakerStatus = await contract.methods.isTieBreakerActive().call();
      console.log(isTieBreakerStatus);
      await setTieBreakerStatus(isTieBreakerStatus);
    } catch (error) {
      setErrorText(error);
      setOpen(true);
      console.error('Error fetching isTieBreakerStatus:', error);
    }
  }

  const fetchCandidates = async () => {
    try {
      const web3 = await getWeb3Instance();
      const contract = await getContractInstanceByAddress(web3, data.address);
      const candidateData = await contract.methods.getAllCandidates().call();
      await setCandidatesLoading(false);

      const maxCandidatesCount = await contract.methods.maxCandidatesCount().call();
      setMaxCandidatesCount(maxCandidatesCount.toString());
      setCandidates(candidateData);
    } catch (error) {
      setErrorText(error);
      setOpen(true);
      console.error('Error fetching candidates:', error);
    }
  };

  const startTieBreaker = async() => {
    try {
      const web3 = await getWeb3Instance();
      const contract = await getContractInstanceByAddress(web3, data.address);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      await contract.methods.startTieBreaker().send({ from: accounts[0], gas: 300000});
      await setTieBreakerStatus(true);
      alert("Tie breaker is started.");
    } catch (error) {
      setErrorText(error.message);
      setOpen(true);
      console.error('Error calling startTieBreaker():', error);
    }
  }

  const startVotingManually = async() => {
    try {
      const web3 = await getWeb3Instance();
      const contract = await getContractInstanceByAddress(web3, data.address);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      await contract.methods.startVoting().send({ from: accounts[0], gas: 300000});
      alert("The voting is started manually.");
    } catch (error) {
      setErrorText(error.message);
      setOpen(true);
      console.error('Error calling startVotingManually():', error);
    }
  }

  const getWinner = async() => {
    try {
      const web3 = await getWeb3Instance();
      const contract = await getContractInstanceByAddress(web3, data.address);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const winner = await contract.methods.getWinner().call({ from: accounts[0], gas: 300000});
      console.log(winner);
      setWinner(winner.winnerName + " - " + winner.highestVotes + " votes");
      alert("The winner is " + winner.winnerName + " with " + winner.highestVotes + " votes. Congrats!");
    } catch (error) {
      setErrorText(error.message);
      setOpen(true);
      console.error('Error calling getWinner :', error);
    }
  }
 

  const voteCandidate = async(candidate) => {
    try {
      const web3 = await getWeb3Instance();
      const contract = await getContractInstanceByAddress(web3, data.address);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      await contract.methods.vote(candidate[0], Date.now()).send({ from: accounts[0], gas: 300000});
      fetchCandidates();
    } catch (error) {
      console.log(error);
      setErrorText(error.message);
      setOpen(true);
      console.error('Error voting a new candidate:', error.message);
    }
  }
 


  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  const addCandidate = async ()=> {
    if ( candidateName != null && candidateName != ""){
      try {
        const web3 = await getWeb3Instance();
        const contract = await getContractInstanceByAddress(web3, data.address);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        await contract.methods.addCandidate(candidateName).send({ from: accounts[0], gas: 300000});
        fetchCandidates();
        setCandidateName("");
      } catch (error) {
        console.log(error);
      setErrorText(error.message);
        setOpen(true);
      }
    }
  }
  
  useEffect(() => {
    // Set up interval to call the function every 5 seconds
    const intervalId = setInterval(() => {
      fetchCandidates();
      fetchTieBreakerStatus();
    }, 5000); // 5000 milliseconds = 5 seconds

    fetchCandidates();
    fetchTieBreakerStatus();

    // Clean up the interval when the component is unmounted
    return () => {
      clearInterval(intervalId);
    };
  }, []); // Empty dependency array ensures this runs once when the component mounts

  return (
    <>
    <div style={{marginBottom: 20}} className="nav-buttons">
      <Link style={style.navButtonStyle} to={`/contracts`}>Contracts</Link>
      <Link style={style.navButtonStyle} to={`/votes/${votingContractAddress}`}>Votes</Link>
      </div>
    <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={"error"} sx={{ width: '100%' }}>
          {errorText}
        </Alert>
      </Snackbar>
      <div className="candidate-list">
      <div style={{ marginBottom:  20}}>
        <h1 style={{fontSize:32}} className="title">Candidate List ({candidates.length})</h1>
        <p style={{fontSize: 16}}>Choose a candidate for the Votier election. The list of candidates sorted by name! Max candidates can be {maxCandidatesCount}.</p>
      </div>
      <ul style={{ marginBottom:  20}} className="candidate-items">
        {candidates.length > 0 && candidatesLoading == false ? <>
            {candidates.sort((a, b) => {
            // Compare names in descending order
            if (a.name > b.name) return 1;
            if (a.name < b.name) return -1;
            return 0;
          }).map((candidate, index) => (
            <div style={{border:'1px solid #555', borderRadius: 10, padding: 10, marginBottom: 10, display:'flex', justifyContent: 'space-between'}} key={index}>
              <p style={{fontSize: 32}}>{candidate.name}</p>
              <div>
                <span style={{background:'#fff', color: '#000', padding: 8, borderRadius: 50, marginRight: 15, fontSize: 24}}>{candidate.voteCount.toString()}</span>
                <button onClick={()=> voteCandidate(candidate)}>Vote this</button>
              </div>
            </div>
          ))}
        </> : candidatesLoading == true ? "...loading..." : "There is no candidates. Please add a candidate."}
      </ul>
      <input placeholder="Candidate Name" style={{background:'#fff', padding:"10px", height: 50, borderRadius: 16, color: '#000', marginRight: 10}} value={candidateName} onChange={e => setCandidateName(e.target.value)} />
      <button style={{background: '#fff', color: '#000', padding: "8px 8px", borderRadius: 16, fontSize: 24, marginRight: 10, backgroundColor: '#fff'}} onClick={addCandidate}>Add Candidate</button>
      {tieBreakerStatus == false ? <>
        <button style={{background: '#fff', color: '#000', padding: "8px 8px", borderRadius: 16, fontSize: 24, marginRight: 10, backgroundColor: '#5d8'}} onClick={startTieBreaker}>Start Tie Breaker</button>
      </> : ""} 
      <button style={{background: '#fff', color: '#000', padding: "8px 8px", borderRadius: 16, fontSize: 24, marginRight: 10}} onClick={getWinner}>{winner == "" ? "Get Winner" : winner}</button>
      <button style={{background: '#fff', color: '#000', padding: "8px 8px", borderRadius: 16, fontSize: 24, marginRight: 10, backgroundColor: '#fff'}} onClick={startVotingManually}>Start Voting</button>
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
