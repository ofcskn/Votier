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

  return (
    <>
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <div style={{textAlign:'center'}} className="nav-buttons">
        <h1 style={{ color: '#888', fontSize: 48, fontFamily: 'sans-serif'}}>Votier</h1>
        <h2 style={{ color: '#666', fontSize: 32, fontFamily: 'sans-serif', marginBottom: 25}}>The Blockchain Voting System</h2>
        <a style={style.navButtonStyle} href="/contracts">Contracts</a>
     </div>
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
