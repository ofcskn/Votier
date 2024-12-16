// Define the contract
var Votier = artifacts.require("Votier");

module.exports = function(deployer) {
  const maxCandidatesCount = 10; 
  // Deploy the contract
  deployer.deploy(Votier, maxCandidatesCount);
};
