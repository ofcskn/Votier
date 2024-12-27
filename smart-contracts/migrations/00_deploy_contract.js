// Define the contract
var Votier = artifacts.require("Votier");

module.exports = function(deployer) {
  const endVotingDate = "2024-12-28 01:35:00";
  const endVotingTimestamp = new Date(endVotingDate).getTime();
  console.log(endVotingTimestamp);
  const maxCandidatesCount = 10; 
  // Deploy the contract
  deployer.deploy(Votier, maxCandidatesCount, endVotingTimestamp);
};
