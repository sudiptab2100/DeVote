App = {
    web3provider: null,
    contracts: {},
    winner: 0,
    winnerVotes: 0,

    init: function() {
        console.log('-----------------------------------------------');
        console.log('App Initialized...');
        App.initWeb3();
        $('#content').hide();
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
                App.result();
            });
        });
    },
    result: function() {
        var deElect;
        App.contracts.DeElect.deployed().then(function(instance) {
            deElect = instance;
            return instance.winnerWho();
        }).then(function(winner) {
            console.log("Winner: ", winner.toNumber());
            App.winner = winner.toNumber();
            return deElect.getVoteCounts(winner.toNumber());
        }).then(function(votes) {
            App.winnerVotes = votes.toNumber();
            App.setUI();
        });
    },
    setUI: function() {
        var pic_src = ['shinchan.jpg', 'Doremon.jpg'];
        var name = ['Shinchan', 'Doremon'];
        document.getElementById('winnerPic').src = pic_src[App.winner];
        $('#winnerName').html(name[App.winner]);
        $('#winnerCount').html(App.winnerVotes);
        $('#content').show();
    }
}



$(document).ready(function() {
    App.init();
});