App = {
    web3provider: null,
    contracts: {},
    account: '0x0',
    approvalPeriod: 0,
    delegationPeriod: 0,
    votingPeriod: 0,
    strength: 0,

    init: function() {
        console.log('--------------------------------------------------------------');
        console.log('App Initialized...');
        App.initWeb3();
    },
    enableVoting: function() {
        const vote1 = document.getElementById('vote1');
        vote1.disabled = false;
        const vote2 = document.getElementById('vote2');
        vote2.disabled = false;
    },
    disableVoting: function() {
        const vote1 = document.getElementById('vote1');
        vote1.disabled = true;
        const vote2 = document.getElementById('vote2');
        vote2.disabled = true;
    },
    enableDelegate: function() {
        const delegateButton = document.getElementById('delegateButton');
        delegateButton.disabled = false;
    },
    disableDelegate: function() {
        const delegateButton = document.getElementById('delegateButton');
        delegateButton.disabled = true;
    },
    resultPage: function() {
        $('#result').show();
        $('#content').hide();
    },
    contentPage: function() {
        $('#content').show();
        $('#result').hide();
    },
    initWeb3: function() {
        if(window.ethereum) {
            console.log('MetaMask Installed...');
            App.web3provider = window.ethereum;
            window.web3 = new Web3(window.ethereum);
            window.ethereum.enable();
        } else {
            // Specify default instance if no web3 instance provided
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            window.web3 = new Web3(window.ethereum);
        }
        App.initContracts();
    },
    initContracts: function() {
        $.getJSON('DeElect.json', function(deElect) {
            App.contracts.DeElect = TruffleContract(deElect);
            App.contracts.DeElect.setProvider(App.web3provider);
            App.contracts.DeElect.deployed().then(function(instance) {
                console.log('DeElect Contract Address: ', instance.address);
                App.render();
                App.listenForEvents();
            });
        });
    },
    render: function(){
        App.contentPage();
        App.setTimePeriods();
        App.setVoteCounts();
    },
    listenForEvents: function() {
        App.contracts.DeElect.deployed().then(function(instance) {
            instance.ApproveStrength({
                filter: {},
                fromBlock: 0
            }, function(error, event) { 
                console.log("ApproveStrength Event: ", event); 
                App.render(); 
            });
            instance.DelegateVote({
                filter: {},
                fromBlock: 0
            }, function(error, event) { 
                console.log("DelegateVote Event: ", event); 
                App.render(); 
            });
            instance.CastVote({
                filter: {},
                fromBlock: 0
            }, function(error, event) { 
                console.log("CastVote Event: ",event); 
                App.render(); 
            });
        });
    },
    refreshAccount: function() {
        web3.eth.getAccounts().then(function(accounts) {
            App.account = accounts[0];
            App.connectedToWeb3();
        });
    },
    connectedToWeb3: function() {
        if(App.account !== '0x0') {
            console.log("Account: ", App.account);
            App.contracts.DeElect.deployed().then(function(instance) {
                return instance.voterStrengths(App.account);
            }).then(function(strength) {
                console.log(strength.toNumber());
                App.strength = strength.toNumber();
                $('#strength').html(strength.toNumber());
                $('#disconnected').hide();
                $('#connected').show();
                App.timeManager();
            });
        }
    },
    setTimePeriods: function() {
        var deElect;
        App.contracts.DeElect.deployed().then(function(instance) {
            deElect = instance;
            return deElect.voterApprovalPeriod();
        }).then(function(time) {
            App.voterApprovalPeriod = time;
            return deElect.delegationPeriod();
        }).then(function(time) {
            App.delegationPeriod = time;
            return deElect.votingPeriod();
        }).then(function(time) {
            App.votingPeriod = time;
            App.setEC();
        });
    },
    setEC: function() {
        App.contracts.DeElect.deployed().then(function(instance) {
            return instance.electionCommision();
        }).then(function(address) {
            App.EC = address;
            App.refreshAccount();
        });
    },
    timeManager: function() {
        var timeNow = Math.round(Date.now()/1000);

        if(timeNow <= App.voterApprovalPeriod){
            App.disableDelegate();
            App.disableVoting();
            if(App.EC === App.account) {
                window.location.replace('approve-strength.html');
            }
        } else if(timeNow <= App.delegationPeriod) {
            App.disableVoting();
            if((App.EC !== App.account) && (App.strength > 0)) App.enableDelegate();
            else App.disableDelegate();
        } else if(timeNow <= App.votingPeriod) {
            if((App.EC !== App.account) && (App.strength > 0)) App.enableVoting();
            else App.disableVoting();
            App.disableDelegate();
        } else {
            App.disableDelegate();
            App.disableVoting();
            App.resultPage();
        }
    },
    delegateStrength: function() {
        var address = $('#address').val();
        App.contracts.DeElect.deployed().then(function(instance) {
            return instance.delegateStrength(address, {
                from: App.account
            });
        }).then(function(receipt) {
            console.log("Delegation Receipt: ", receipt);
        });
    },
    castVote: function(candidate) {
        App.contracts.DeElect.deployed().then(function(instance) {
            return instance.castVote(candidate, {
                from: App.account
            });
        }).then(function(receipt) {
            console.log("Vote Receipt: ", receipt);
        });
    },
    setVoteCounts: function() {
        var vote1, vote2, deElect;
        App.contracts.DeElect.deployed().then(function(instance) {
            deElect = instance;
            return deElect.getVoteCounts(0);
        }).then(function(count) {
            vote1 = count.toNumber();
            return deElect.getVoteCounts(1);
        }).then(function(count) {
            vote2 = count.toNumber();
            $('#shinchanCount').html(vote1);
            $('#doremonCount').html(vote2);
        });
    },
    result: function() {
        var deElect;
        App.contracts.DeElect.deployed().then(function(instance) {
            deElect = instance;
            return instance.winnerWho();
        }).then(function(winner) {
            console.log("Winner: ", winner.toNumber());
            window.location.replace('winner.html');
        });
    }
}



$(document).ready(function() {
    App.init();
});

window.ethereum.on('accountsChanged', (accounts) => {
    App.render();
});