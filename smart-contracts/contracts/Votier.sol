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
        bool tied; // For second step
    }

    // Structure to hold voter details
    struct Voter {
        bool hasVoted; // Whether the voter has already voted
        bool hasVotedForTie; // Whether the voter has already voted for second step
        uint votedCandidateId; // ID of the candidate the voter voted for
        uint votedTime;
        uint tieVotedTime;
    }

    uint public immutable creationTime;
    uint public immutable endVotingTime;

    address public admin; // Address of the admin managing the voting system
    mapping(uint => Candidate) public candidates; // Mapping of candidate ID to Candidate details
    mapping(address => Voter) public voters; // Mapping of voter address to Voter details

    uint public votesCount; // Total number of votes added
    uint public candidatesCount; // Total number of candidates added
    uint public tiedCandidatesCount; // Total number of tied candidates added
    uint public maxCandidatesCount; // Max candidates can be joined to the election
    mapping(string => bool) public candidateNames; // Mapping to track if a candidate name already exists
    
    // Secondary voting
    uint private secondaryVotingStartTime;
    uint private secondaryVotingEndTime;
    bool public isTieBreakerActive;
    bool private votingStatus;

    // Event emitted when a new candidate is added
    event CandidateAdded(uint id, string name);
    // Event emitted when a vote is cast
    event Voted(address voter, uint indexed candidateId, uint votedTime, uint newVoteCount);
    // Debugging event
    event AdminInitialized(address admin); 
    // Debugging event
    event ContractDeployed(string message); 
    // Declare the exact winner
    event WinnerDeclared(uint candidateId);

    // Modifier to restrict access to admin-only functions
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier hasNotVoted() {
        require(!voters[msg.sender].hasVoted, "You have already voted");
        _;
    }

    modifier hasNotVotedForTie() {
        require(!voters[msg.sender].hasVotedForTie, "You have already voted for tie step.");
        _;
    }

    modifier votingOpen() {
        require(block.timestamp < endVotingTime && isTieBreakerActive == false, "Voting has ended");
        _;
    }

    modifier votingEnded(){
        if(isTieBreakerActive){
            require(block.timestamp > secondaryVotingEndTime && isTieBreakerActive == true, "Tie Breaker voting continues due to time. continues due to time.");
        }
        else {
            require(block.timestamp > endVotingTime && isTieBreakerActive == false, "Voting continues due to time.");
        }
        _;
    }

    modifier votingTieBreakerOpen() {
        require(block.timestamp < secondaryVotingEndTime && isTieBreakerActive == true, "Tie Breaker voting has ended");
        _;
    }

    modifier tieBreakerActive() {
        require(isTieBreakerActive, "No tie-breaker is active");
        _;
    }

    modifier votingStarted() {
        require(votingStatus == true, "The voting has not started yet.");
        _;
    }

    modifier votingNotStarted() {
        require(votingStatus == false, "The voting is started manually by the admin.");
        _;
    }

    /**
     * @dev Constructor sets the deploying address as the admin.
     */
    constructor(uint _maxCandidatesCount, uint _endVotingTime) {
        uint normalizedEndVotingTime = _endVotingTime / 1000;
        require(_maxCandidatesCount > 1 && _maxCandidatesCount < 50, "Candidates must be at least two people and <50.");
        require(normalizedEndVotingTime > block.timestamp, "End voting time must be in the future");
        require(normalizedEndVotingTime >= block.timestamp + 5 minutes, "Voting must last at least 5 minutes");

        creationTime = block.timestamp;
        endVotingTime = normalizedEndVotingTime;
        maxCandidatesCount = _maxCandidatesCount;
        admin = msg.sender;
        votingStatus = false;
        emit AdminInitialized(admin);
        emit ContractDeployed("VotingSystem deployed successfully!");
    }

    /**
    * @dev to start voting.
    */
    function startVoting() public onlyAdmin votingNotStarted {
        votingStatus = true;
    }

    /**
    * @dev to end voting.
    */
    function endVoting() public onlyAdmin votingStarted {
        votingStatus = false;
    }

    /**
     * @dev Function to get all candidates (iterate using candidatesCount)
     * @return The candidates.
     */
    function getAllCandidates() public view returns (Candidate[] memory) {
        Candidate[] memory allCandidates = new Candidate[](candidatesCount);
        
        for (uint i = 1; i <= candidatesCount; i++) {
            allCandidates[i - 1] = candidates[i];
        }
        
        return allCandidates;
    }


    /**
     * @dev Adds a new candidate to the voting system.
     * @param _name The name of the candidate to be added.
     */
    function addCandidate(string memory _name) public onlyAdmin votingOpen votingNotStarted{
        require(maxCandidatesCount > candidatesCount, "Candidates count for an election cannot be equal with max value!");
        require(bytes(_name).length > 0, "Candidate name cannot be empty.");
        require(!candidateNames[_name], "Candidate name already exists.");
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0, false);
        candidateNames[_name] = true; // Mark the name as used
        emit CandidateAdded(candidatesCount, _name);
    }
    
    /**
     * @dev Allows a user to vote for a candidate.
     * @param _candidateId The ID of the candidate to vote for.
     */
    function vote(uint _candidateId) public votingStarted {
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID");
        require(candidatesCount > 1, "There must be at least two candidates for a vote to be cast.");
        // If tie-breaker is active
        if (isTieBreakerActive) {
            voteInTieBreaker(_candidateId);
        } else {
            voteInFirst(_candidateId);
        }
    }

    /**
     * @dev Allows a user to vote for a candidate.
     * @param _candidateId The ID of the candidate to vote for.
     */
    function voteInFirst(uint _candidateId) public hasNotVoted {
        voters[msg.sender] = Voter(true, false, _candidateId, block.timestamp, 0);
        candidates[_candidateId].voteCount++;
        votesCount++;

        emit Voted(msg.sender, _candidateId, block.timestamp, candidates[_candidateId].voteCount);
    }

    /**
     * @dev Allows a user to vote in the tie-breaker round.
     * @param _candidateId The ID of the candidate to vote for in the tie-breaker round.
     */
    function voteInTieBreaker(uint _candidateId) public tieBreakerActive hasNotVotedForTie {
        bool isTiedCandidate = false;
        
        // Check if the candidate is in the list of tied candidates
        for (uint i = 1; i <= candidatesCount; i++) {
            if (candidates[i].id == _candidateId && candidates[i].tied == true)  {
                isTiedCandidate = true;
                break;
            }
        }

        require(isTiedCandidate, "Invalid candidate in the tie-breaker round.");

        if (voters[msg.sender].votedTime == 0){
            voters[msg.sender] = Voter(false, true, _candidateId, 0, block.timestamp);
        }
        else {
            voters[msg.sender].hasVotedForTie = true;
        }

        candidates[_candidateId].voteCount++;
        votesCount++;

        emit Voted(msg.sender, _candidateId, block.timestamp, candidates[_candidateId].voteCount);
    }

   /**
     * @dev Starts the tie-breaker round if there are candidates with equal votes.
     */
    function startTieBreaker() public onlyAdmin votingEnded {
        uint maxVotes = 0;

        // First, determine the maximum number of votes any candidate has
        for (uint i = 1; i <= candidatesCount; i++) {
            if (candidates[i].voteCount > maxVotes) {
                maxVotes = candidates[i].voteCount;
            }
        }

        for (uint i = 1; i <= candidatesCount; i++) {
            if (candidates[i].voteCount == maxVotes) {
                candidates[i].tied = true;
                tiedCandidatesCount++;
            }
        }

        // If there are more than one candidate tied, initiate the tie-breaking round
        require(tiedCandidatesCount > 1, "No tie to break!");

        // Set flag for tie-breaker and define time for the secondary round
        isTieBreakerActive = true;
        secondaryVotingStartTime = block.timestamp;
        secondaryVotingEndTime = block.timestamp + 1 hours;  // 1 hour for tie-breaker voting duration
    }

    /**
     * @dev Declares the winner after either the regular or tie-breaker voting round.
     */
    function getWinner() public onlyAdmin votingEnded returns (uint winnerId, string memory winnerName, uint highestVotes) {
        require(candidatesCount > 1, "There must be at least two candidates for a vote to get winner.");
        require(votesCount > 1, "There must be at least two votes to get winner.");

        uint highestVoteCount = 0;
        uint winnerCandidateId = 0;

        for (uint i = 1; i <= candidatesCount; i++) {
            if (candidates[i].voteCount > highestVoteCount) {
                highestVoteCount = candidates[i].voteCount;
                winnerCandidateId = i;
            }
        }

        // Declare the winner
        emit WinnerDeclared(winnerCandidateId);

        winnerId = winnerCandidateId;
        winnerName = candidates[winnerCandidateId].name;
        highestVotes = highestVoteCount;

        return (winnerId, winnerName, highestVotes);

        // Reset tie-breaker state
        isTieBreakerActive = false;
        votingStatus = false;
    }
}
