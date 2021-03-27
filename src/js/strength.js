App = {
    EC: null,
    account: null,
    contracts: {},
    web3provider: null,
    time: 0,

    init: function(account) {
        console.log('App Initialized');
        App.initWeb3(account);
    },
    initWeb3: function(account) {
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
        App.account = account;
        App.initContracts();
    },
    initContracts: function() {
        $.getJSON('DeElect.json', function(deElect){
            App.contracts.DeElect = TruffleContract(deElect);
            App.contracts.DeElect.setProvider(App.web3provider);
            App.contracts.DeElect.deployed().then(function(instance) {
                console.log("Contract Address: ", instance.address);
            });
        }).done(function() {
            App.setEC();
            App.timeLeftForApproval();
        });
    },
    setEC: function() {
        var deElectInstance;
        App.contracts.DeElect.deployed().then(function(instance) {
            deElectInstance = instance;
            return instance.electionCommision();
        }).then(function(address) {
            App.EC = address;
            console.log('EC Account : ', App.EC);
            return deElectInstance.voterStrengths(App.EC);
        }).then(function(strength) {
            $('#strength').html(strength.toNumber());
            App.loadPage();
        });
    },
    loadPage: function() {
        var left = App.time;
        console.log(left);
        if((App.EC === App.account) && (App.time > 0)) {
            $("#notEC").hide();
            $("#isEC").show();
        } else {
            $("#isEC").hide();
            $("#notEC").show();
        }
    },
    approveStrength: function() {
        App.timeLeftForApproval();
        if(App.time < 0) return;
        var address = $('#address').val();
        App.contracts.DeElect.deployed().then(function(instance) {
            return instance.approveStrength(address, {
                from: App.EC
            });
        }).then(function(receipt) {
            console.log(receipt);
            document.getElementById('address').value = '';
            App.init(App.account);
        });
    },
    timeLeftForApproval: function() {
        App.contracts.DeElect.deployed().then(function(instance) {
            return instance.voterApprovalPeriod();
        }).then(function(time) {
            App.time = time - Math.round(Date.now()/1000);
        });
    }
}




$(document).ready(function() {
    new Web3(window.ethereum).eth.getAccounts().then(function(accounts) {
        console.log('User Account: ', accounts[0]);
        App.init(accounts[0]);
    });
});

window.ethereum.on('accountsChanged', (_accounts) => {
    new Web3(window.ethereum).eth.getAccounts().then(function(accounts) {
        console.log('User Account: ', accounts[0]);
        App.init(accounts[0]);
    });
});
