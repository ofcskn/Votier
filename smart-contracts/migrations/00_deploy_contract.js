// Define the contract
var Votier = artifacts.require("Votier");

module.exports = function(deployer) {
  // Deploy the contract
  deployer.deploy(Votier);
};
