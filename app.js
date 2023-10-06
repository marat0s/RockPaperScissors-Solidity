const web3 = new Web3(Web3.givenProvider); // Using MetaMask's provider
const contractAddress = '0x6176C438186cC9f5F42aFafEE16758Ee3cc11DAd'; // Replace with your deployed contract address
const contractABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "winner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "loser",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "reward",
				"type": "uint256"
			}
		],
		"name": "GameResult",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_commit",
				"type": "bytes32"
			}
		],
		"name": "joinGame",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "player1",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "commit",
				"type": "bytes32"
			}
		],
		"name": "NewGame",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "player2",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "commit",
				"type": "bytes32"
			}
		],
		"name": "PlayerJoined",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "enum RockPaperScissors.Choice",
				"name": "_choice",
				"type": "uint8"
			},
			{
				"internalType": "string",
				"name": "_secret",
				"type": "string"
			}
		],
		"name": "revealChoice",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "enum RockPaperScissors.Choice",
				"name": "choice",
				"type": "uint8"
			}
		],
		"name": "Revealed",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_commit",
				"type": "bytes32"
			}
		],
		"name": "startGame",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "betAmount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "currentGame",
		"outputs": [
			{
				"internalType": "address payable",
				"name": "player1",
				"type": "address"
			},
			{
				"internalType": "address payable",
				"name": "player2",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "player1Commit",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "player2Commit",
				"type": "bytes32"
			},
			{
				"internalType": "enum RockPaperScissors.Choice",
				"name": "player1Reveal",
				"type": "uint8"
			},
			{
				"internalType": "enum RockPaperScissors.Choice",
				"name": "player2Reveal",
				"type": "uint8"
			},
			{
				"internalType": "enum RockPaperScissors.GameState",
				"name": "state",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "enum RockPaperScissors.Choice",
				"name": "_choice",
				"type": "uint8"
			},
			{
				"internalType": "string",
				"name": "_secret",
				"type": "string"
			}
		],
		"name": "getChoiceCommit",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getContractBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]; // Replace with your contract ABI

const contract = new web3.eth.Contract(contractABI, contractAddress);

let accounts = [];

async function init() {
    accounts = await web3.eth.getAccounts();
    setupEventListeners();
}

function setupEventListeners() {
    contract.events.NewGame({}, (error, event) => {
        if (error) {
            console.error("Error in NewGame event:", error);
            return;
        }
        document.getElementById('player1Info').innerText = `Player 1: ${event.returnValues.player1}`;
    });

    contract.events.PlayerJoined({}, (error, event) => {
        if (error) {
            console.error("Error in PlayerJoined event:", error);
            return;
        }
        document.getElementById('player2Info').innerText = `Player 2: ${event.returnValues.player2}`;
    });

    contract.events.Revealed({}, (error, event) => {
        if (error) {
            console.error("Error in Revealed event:", error);
            return;
        }

        if (event.returnValues.player === accounts[0]) {
            document.getElementById('choiceInfo').innerText = `Your choice: ${convertChoice(event.returnValues.choice)}`;
        } else {
            document.getElementById('choiceInfo').innerText += `\nOpponent's choice: ${convertChoice(event.returnValues.choice)}`;
        }
    });

    contract.events.GameResult({}, (error, event) => {
        if (error) {
            console.error("Error in GameResult event:", error);
            return;
        }
        document.getElementById('results').innerText = `Winner: ${event.returnValues.winner}, Reward: ${web3.utils.fromWei(event.returnValues.reward, 'ether')} ETH`;
    });
}

function convertChoice(choiceValue) {
    switch (choiceValue) {
        case '1':
            return 'Rock';
        case '2':
            return 'Paper';
        case '3':
            return 'Scissors';
        default:
            return 'Unknown';
    }
}

async function startGame() {
    const choice = document.getElementById('playerChoice').value;
    const secret = document.getElementById('secretString').value;
    const hashedCommit = await contract.methods.getChoiceCommit(choice, secret).call();

    contract.methods.startGame(hashedCommit).send({ from: accounts[0], value: web3.utils.toWei('0.0001', 'ether') });
}

async function joinGame() {
    const choice = document.getElementById('playerChoice').value;
    const secret = document.getElementById('secretString').value;
    const hashedCommit = await contract.methods.getChoiceCommit(choice, secret).call();

    contract.methods.joinGame(hashedCommit).send({ from: accounts[0], value: web3.utils.toWei('0.0001', 'ether') });
}

async function revealChoice() {
    const choice = document.getElementById('playerChoice').value;
    const secret = document.getElementById('secretString').value;

    contract.methods.revealChoice(choice, secret).send({ from: accounts[0] });
}

init();
