import { json, type MetaFunction } from "@remix-run/node";
import { useEffect, useState } from 'react';
import { getWeb3Instance, getContractInstance } from '../../utils/web3.js';
import Alert from '@mui/material/Alert';
import { Snackbar } from "@mui/material";

export const meta: MetaFunction = () => {
  return [
    { title: "Votier App" },
    { name: "description", content: "Welcome to Votier!" },
  ];
};

export default function Index() {
  const [errorText, setErrorText] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [open, setOpen] = useState(false);
  const [maxCandidatesCount, setMaxCandidatesCount] = useState("");

  const voteCandidate = async(candidate) => {
    try {
      const web3 = await getWeb3Instance();
      const contract = await getContractInstance(web3);
      
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const candidateData = await contract.methods.vote(candidate[0]).send({ from: accounts[0], gas: 300000});
      const candidateCountData = await contract.methods.getAllCandidates().call();
      setCandidates(candidateCountData);
    } catch (error) {
      setErrorText(error.message);
      setOpen(true);
      console.error('Error adding a new candidate:', name);
      console.error('Error adding a new candidate:', error.message);
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
        const contract = await getContractInstance(web3);
        
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const candidateData = await contract.methods.addCandidate(candidateName).send({ from: accounts[0], gas: 300000});
        const candidateCountData = await contract.methods.getAllCandidates().call();
        setCandidates(candidateCountData);
      } catch (error) {
      setErrorText(error.message);
        setOpen(true);
      }
    }
  }
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const web3 = await getWeb3Instance();
        const contract = await getContractInstance(web3);
        const candidateData = await contract.methods.getAllCandidates().call();

        const maxCandidatesCount = await contract.methods.maxCandidatesCount().call();
        setMaxCandidatesCount(maxCandidatesCount.toString());

      setCandidates(candidateData);
      } catch (error) {
        setErrorText(error);
        setOpen(true);
        console.error('Error fetching candidates:', error);
      }
    };

    fetchCandidates();
  }, []);

  return (
    <>
      <div style={{marginBottom: 20}} className="nav-buttons">
      <a style={style.navButtonStyle} href="/">Candidates</a>
      <a style={style.navButtonStyle} href="/votes">Votes</a>
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
      </ul>
      <input placeholder="Candidate Name" style={{background:'#fff', padding:"10px", height: 50, borderRadius: 16, color: '#000', marginRight: 10}} value={candidateName} onChange={e => setCandidateName(e.target.value)} />
      <button style={{background: '#fff', color: '#000', padding: "8px 8px", borderRadius: 16, fontSize: 24}} onClick={addCandidate}>Add Candidate</button>
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
