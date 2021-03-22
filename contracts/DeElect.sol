// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract DeElect {
    uint256 public numberOfCandidates = 2; // Number of Candidates
    uint256 public numberOfVoters = 5; // Total number of voters

    mapping(address => uint256) public voterStrengths; // Strength of Voter 
    uint256[] public voteCounts; // Count of Votes of Candidates
    address public electionCommision;

    uint256 public voterApprovalPeriod;
    uint256 public delegationPeriod;
    uint256 public votingPeriod;



    // Verify if user is Election Commision or Not
    modifier EC {
        require(msg.sender == electionCommision);
        _;
    }
    // Valid Voter Check
    modifier voter {
        require(voterStrengths[msg.sender] >= 1, "Zero Strength");
        require(msg.sender != electionCommision, "Not a Voter");
        _;
    }
    // Voting Period Check
    modifier votingTime {
        require(block.timestamp > delegationPeriod, "Vote casting not started yet");
        require(block.timestamp <= votingPeriod, "Vote casting ended");
        _;
    }
    // Voter Approval Period Check
    modifier approvalTime {
        require(block.timestamp <= voterApprovalPeriod, "Strength Cannot Be Approved Anymore");
        _;
    }
    // Delegation Period Check
    modifier delegationTime {
        require(block.timestamp > voterApprovalPeriod, "Strength Delegation Period not started yet");
        require(block.timestamp <= delegationPeriod, "Strength Delegation Period Ended");
        _;
    }



    constructor () public {
        voteCounts = new uint256[](numberOfCandidates);
        electionCommision = msg.sender;
        voterStrengths[electionCommision] = numberOfVoters; // Initially EC will have all the voting strengths, which will be distributed among voters equally

        voterApprovalPeriod = block.timestamp + 10; // In this period, EC will be able to distribute voting strengths to Voters
        delegationPeriod = voterApprovalPeriod + 20; // In this period, Voters will be able to delegate steir strengths to others
        votingPeriod = delegationPeriod + 10; // Casting votes will be accepted during this period 
    }



    // EC Approves Voting strength to voters
    function approveStrength(address _voter) external EC approvalTime returns(bool) {
        require(voterStrengths[_voter] != 1, "Already approved Strength");
        require(_voter != electionCommision);
        require(voterStrengths[electionCommision] >= 1, "Strength Approval Completed");

        voterStrengths[_voter] = 1;
        voterStrengths[electionCommision] -= 1;
        return true;
    }

    // Cast your vote
    // Input => Candidate No.
    function castVote(uint256 _candidate) external voter votingTime {
        require(0 <= _candidate && _candidate < numberOfCandidates, "Not a candidate");

        voteCounts[_candidate] += voterStrengths[msg.sender];
        voterStrengths[msg.sender] = 0;
    }

    // Delegate your strength to someone you want to cast vote for you
    function delegateStrength(address _voter) external voter delegationTime {
        require(_voter != electionCommision, "Can't delegate strength to EC");
        require(voterStrengths[_voter] >= 1, "Delegation to Zero-Strength Account is restricted");

        voterStrengths[_voter] += voterStrengths[msg.sender];
        voterStrengths[msg.sender] = 0;
    }

    // Who's the winner
    function winnerWho() public view returns(uint256) {
        require(block.timestamp > votingPeriod, "Winner not finalised yet");

        uint256 winner;
        for(uint256 i=0; i<numberOfCandidates; i++) {
            if(voteCounts[i] > voteCounts[winner]) {
                winner = i;
            }
        }

        return winner;
    }

}