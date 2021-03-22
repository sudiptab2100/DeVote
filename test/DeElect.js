var DeElect = artifacts.require("./DeElect.sol");

contract('DeElect', function(accounts) {
    var voteInstance;
    var candidates = 2;
    var voters = 5;
    var EC = accounts[0];

    function delay(message, interval) {
        return it(message, done => {
          setTimeout(() => done(), interval)
        }).timeout(interval + 100) // The extra 100ms should guarantee the test will not fail due to exceeded timeout
    }

    it('Checking Numbers...', function() {
        return DeElect.deployed().then(function(instance) {
            voteInstance = instance;
            return voteInstance.numberOfCandidates();
        }).then(function(value) {
            assert.equal(value.toNumber(), 2, "No of candidates didn't match");
            return voteInstance.numberOfVoters();
        }).then(function(value) {
            assert.equal(value.toNumber(), voters, "No of voters didn't match");
            return voteInstance.electionCommision();
        }).then(function(address) {
            assert.equal(address, EC, "EC address didn't match");
        });
    });

    // Testing Exceptions
    it('Approving Strength to EC(Fail Test)', function() {
        return DeElect.deployed().then(function(instance) {
            voteInstance = instance;
            return voteInstance.approveStrength(EC, { from: EC });
        }).then(assert.fail).catch(function(error) {
            assert(error.toString().indexOf('revert') >= 0, "Approved Strength to EC");
        });
    });
    it('Approving Strength from non-EC account(Fail Test)', function() {
        return DeElect.deployed().then(function(instance) {
            voteInstance = instance;
            return voteInstance.approveStrength(accounts[2], { from: accounts[1] });
        }).then(assert.fail).catch(function(error) {
            assert(error.toString().indexOf('revert') >= 0, "Non-EC account approving strength");
        });
    });

    // Approving Strength to 5 voters
    it('Approving Strength to Account 1', function() {
        return DeElect.deployed().then(function(instance) {
            voteInstance = instance;
            return voteInstance.approveStrength(accounts[1], { from: EC });
        }).then(function() {
            return voteInstance.voterStrengths(accounts[1]);
        }).then(function(strength) {
            assert.equal(strength, 1, "Not Approvred Strength");
        });
    });
    it('Approving Strength to Account 2', function() {
        return DeElect.deployed().then(function(instance) {
            voteInstance = instance;
            return voteInstance.approveStrength(accounts[2], { from: EC });
        }).then(function() {
            return voteInstance.voterStrengths(accounts[2]);
        }).then(function(strength) {
            assert.equal(strength, 1, "Not Approvred Strength");
        });
    });
    it('Approving Strength to Account 3', function() {
        return DeElect.deployed().then(function(instance) {
            voteInstance = instance;
            return voteInstance.approveStrength(accounts[3], { from: EC });
        }).then(function() {
            return voteInstance.voterStrengths(accounts[3]);
        }).then(function(strength) {
            assert.equal(strength, 1, "Not Approvred Strength");
        });
    });
    it('Approving Strength to Account 4', function() {
        return DeElect.deployed().then(function(instance) {
            voteInstance = instance;
            return voteInstance.approveStrength(accounts[4], { from: EC });
        }).then(function() {
            return voteInstance.voterStrengths(accounts[4]);
        }).then(function(strength) {
            assert.equal(strength, 1, "Not Approvred Strength");
        });
    });
    it('Approving Strength to Account 5', function() {
        return DeElect.deployed().then(function(instance) {
            voteInstance = instance;
            return voteInstance.approveStrength(accounts[5], { from: EC });
        }).then(function() {
            return voteInstance.voterStrengths(accounts[5]);
        }).then(function(strength) {
            assert.equal(strength, 1, "Not Approvred Strength");
        });
    });

    // Total no of voters is 5, 6th account cannot be approved strenght to vote
    it('Approving Strength to Account 6(Fail Test)', function() {
        return DeElect.deployed().then(function(instance) {
            voteInstance = instance;
            return voteInstance.approveStrength(accounts[6], { from: EC });
        }).then(assert.fail).catch(function(error) {
            assert(error.toString().indexOf('revert') >= 0, "Approved Strength Account 6");
        });
    });


    delay('Voting Started', 25000);

    it('Account 1 votes', function() {
        return DeElect.deployed().then(function(instance) {
            voteInstance = instance;
            return voteInstance.castVote(0, { from: accounts[1] });
        });
    });
    it('Account 2 votes', function() {
        return DeElect.deployed().then(function(instance) {
            voteInstance = instance;
            return voteInstance.castVote(0, { from: accounts[2] });
        });
    });
    it('Account 3 votes', function() {
        return DeElect.deployed().then(function(instance) {
            voteInstance = instance;
            return voteInstance.castVote(0, { from: accounts[3] });
        });
    });
    it('Account 4 votes', function() {
        return DeElect.deployed().then(function(instance) {
            voteInstance = instance;
            return voteInstance.castVote(1, { from: accounts[4] });
        });
    });
    it('Account 5 votes', function() {
        return DeElect.deployed().then(function(instance) {
            voteInstance = instance;
            return voteInstance.castVote(1, { from: accounts[5] });
        });
    });

    delay('Vote Ended', 10000);

    it('Results Checking', function() {
        return DeElect.deployed().then(function(instance) {
            voteInstance = instance;
            return voteInstance.winnerWho({ from: EC });
        }).then(function(result) {
            assert.equal(result.toNumber(), 0, 'Something is wrong');
        });
    });


});