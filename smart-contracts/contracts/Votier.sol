// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/**
 * @title Votier
 * @dev A blockchain-based voting system for selecting the best candidate.
 * Admins can add candidates, and users can vote for their preferred candidate.
 * Ensures transparency and immutability of the voting process.
 */
contract Votier {
    // Structure to hold candidate details
    struct Candidate {
        uint id; // Unique ID of the candidate
        string name; // Name of the candidate
        uint voteCount; // Total votes received by the candidate
    }

    // Structure to hold voter details
    struct Voter {
        bool hasVoted; // Whether the voter has already voted
        uint votedCandidateId; // ID of the candidate the voter voted for
    }

    address public admin; // Address of the admin managing the voting system
    mapping(uint => Candidate) public candidates; // Mapping of candidate ID to Candidate details
    mapping(address => Voter) public voters; // Mapping of voter address to Voter details
    uint public candidatesCount; // Total number of candidates added
    mapping(string => bool) public candidateNames; // Mapping to track if a candidate name already exists

    // Event emitted when a new candidate is added
    event CandidateAdded(uint id, string name);

    // Event emitted when a vote is cast
    event Voted(address voter, uint candidateId);

    event AdminInitialized(address admin); // Debugging event
    event ContractDeployed(string message); // Debugging event

    // Modifier to restrict access to admin-only functions
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    /**
     * @dev Constructor sets the deploying address as the admin.
     */
    constructor() {
        admin = msg.sender;
        emit AdminInitialized(admin);
        emit ContractDeployed("VotingSystem deployed successfully!");
    }

    /**
     * @dev Adds a new candidate to the voting system.
     * @param _name The name of the candidate to be added.
     */
    function addCandidate(string memory _name) public onlyAdmin {
        require(!candidateNames[_name], "Candidate name already exists.");
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
        candidateNames[_name] = true; // Mark the name as used
        emit CandidateAdded(candidatesCount, _name);
    }

    /**
     * @dev Allows a user to vote for a candidate.
     * @param _candidateId The ID of the candidate to vote for.
     */
    function vote(uint _candidateId) public {
        require(!voters[msg.sender].hasVoted, "You have already voted");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID");

        voters[msg.sender] = Voter(true, _candidateId);
        candidates[_candidateId].voteCount++;

        emit Voted(msg.sender, _candidateId);
    }

    // Function to get a candidate by ID (no need to manually define it)
    // The getter is automatically available due to `public` keyword in the mapping

    // Function to get all candidates (iterate using candidatesCount)
    function getAllCandidates() public view returns (Candidate[] memory) {
        Candidate[] memory allCandidates = new Candidate[](candidatesCount);
        
        for (uint i = 1; i <= candidatesCount; i++) {
            allCandidates[i - 1] = candidates[i];
        }
        
        return allCandidates;
    }
    /**
     * @dev Determines the winner of the voting process.
     * @return winnerId The ID of the winning candidate.
     * @return winnerName The name of the winning candidate.
     * @return highestVotes The highest number of votes received by a candidate.
     */
    function getWinner() public view returns (uint winnerId, string memory winnerName, uint highestVotes) {
        uint highestVoteCount = 0;
        uint winningCandidateId = 0;

        for (uint i = 1; i <= candidatesCount; i++) {
            if (candidates[i].voteCount > highestVoteCount) {
                highestVoteCount = candidates[i].voteCount;
                winningCandidateId = i;
            }
        }

        winnerId = winningCandidateId;
        winnerName = candidates[winningCandidateId].name;
        highestVotes = highestVoteCount;
    }
}
