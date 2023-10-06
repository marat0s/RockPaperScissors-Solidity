// Connect to Metamask
window.addEventListener('load', async () => {
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
            await ethereum.enable(); // Request access
        } catch (error) {
            console.error("User denied account access");
        }
    }
    else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider);
    }
    else {
        console.error('Non-Ethereum browser detected. Consider trying MetaMask!');
    }
    initApp();
});

const contractAddress = 'YOUR_CONTRACT_ADDRESS_HERE';
const abi = []; // TODO: Add your ABI generated from the Solidity compiler
const contract = new web3.eth.Contract(abi, contractAddress);

function initApp() {
    document.getElementById('register').addEventListener('click', register);
    document.getElementById('rock').addEventListener('click', () => playMove("Rock"));
    document.getElementById('paper').addEventListener('click', () => playMove("Paper"));
    document.getElementById('scissors').addEventListener('click', () => playMove("Scissors"));
    document.getElementById('reveal').addEventListener('click', revealMove);
    updateInfo();
    listenForEvents();
}

async function register() {
    const accounts = await web3.eth.getAccounts();
    contract.methods.register().send({ from: accounts[0], value: web3.utils.toWei("0.0001", "ether") });
}

function playMove(move) {
    const password = document.getElementById('password').value;
    const encryptedMove = web3.utils.sha3(move + password);
    contract.methods.play(encryptedMove).send({ from: web3.eth.defaultAccount });
}

function revealMove() {
    const move = document.getElementById('moveReveal').value;
    const password = document.getElementById('passwordReveal').value;
    contract.methods.reveal(move, password).send({ from: web3.eth.defaultAccount });
}

async function updateInfo() {
    const balance = await contract.methods.getContractBalance().call();
    const player = await contract.methods.whoAmI().call();
    const bothPlayed = await contract.methods.bothPlayed().call();
    const bothRevealed = await contract.methods.bothRevealed().call();
    
    document.getElementById('contractBalance').innerText = "Contract Balance: " + web3.utils.fromWei(balance, "ether") + " tBNB";
    document.getElementById('playerStatus').innerText = "Player Status: " + (player == 0 ? "Not registered" : "Player " + player);
    if (bothRevealed) {
        document.getElementById('gameState').innerText = "Game State: Game Over";
    } else if (bothPlayed) {
        document.getElementById('gameState').innerText = "Game State: Waiting for reveal";
    } else {
        document.getElementById('gameState').innerText = "Game State: Waiting for moves";
    }
}

function listenForEvents() {
    contract.events.Registered({}, (error, event) => {
        if (!error) {
            alert("New player registered: " + event.returnValues.player);
            updateInfo();
        } else {
            console.error(error);
        }
    });

    contract.events.Played({}, (error, event) => {
        if (!error) {
            alert("Player made a move: " + event.returnValues.player);
            updateInfo();
        } else {
            console.error(error);
        }
    });

    contract.events.Revealed({}, (error, event) => {
        if (!error) {
            alert("Player revealed a move: " + event.returnValues.player);
            updateInfo();
        } else {
            console.error(error);
        }
    });

    contract.events.GameOver({}, (error, event) => {
        if (!error) {
            alert("Game over. Winner: " + event.returnValues.winner + ". Amount: " + web3.utils.fromWei(event.returnValues.amount, "ether") + " tBNB");
            updateInfo();
        } else {
            console.error(error);
        }
    });
}
