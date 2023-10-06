let web3 = new Web3(window.ethereum);
let contract;
let userAddress;

async function init() {
    let networkId = await web3.eth.net.getId();
    if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        userAddress = (await web3.eth.getAccounts())[0];

        let contractAddress = "0x8496A2f4F889D86AD26cC7A512E5faAFEc88C648"; // Replace with your deployed contract address
        let abi = [
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
				"internalType": "uint256",
				"name": "reward",
				"type": "uint256"
			}
		],
		"name": "GameFinished",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "player",
				"type": "address"
			}
		],
		"name": "MoveMade",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "encryptedMove",
				"type": "bytes32"
			}
		],
		"name": "play",
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
			}
		],
		"name": "PlayerRegistered",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "register",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "enum RockPaperScissors.Move",
				"name": "move",
				"type": "uint8"
			},
			{
				"internalType": "string",
				"name": "password",
				"type": "string"
			}
		],
		"name": "reveal",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "bothPlayed",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "bothRevealed",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
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
		"name": "numPlayers",
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "players",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "encryptedMove",
				"type": "bytes32"
			},
			{
				"internalType": "enum RockPaperScissors.Move",
				"name": "move",
				"type": "uint8"
			},
			{
				"internalType": "address payable",
				"name": "addr",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "REVEAL_TIMEOUT",
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
		"name": "revealDeadline",
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
		"name": "revealTimeLeft",
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
		"name": "whoAmI",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]; // Replace with your contract ABI

        contract = new web3.eth.Contract(abi, contractAddress);
    } else {
        alert("Please install MetaMask!");
    }
}

async function register() {
    await contract.methods.register().send({ value: web3.utils.toWei('0.0001', 'ether'), from: userAddress });
}

async function play() {
    let move = document.getElementById('move').value;
    let password = document.getElementById('password').value;
    let encryptedMove = web3.utils.sha3(move + password);

    await contract.methods.play(encryptedMove).send({ from: userAddress });
}

async function reveal() {
    let move = document.getElementById('move').value;
    let password = document.getElementById('password').value;

    // Convert move string to enum value
    let moveEnum = { "Rock": 1, "Paper": 2, "Scissors": 3 };
    await contract.methods.reveal(moveEnum[move], password).send({ from: userAddress });
}

async function getGameInfo() {
    let info = "Player 1: " + (await contract.methods.players(0).call()).addr;
    info += "\nPlayer 2: " + (await contract.methods.players(1).call()).addr;

    document.getElementById('gameInfo').innerText = info;
}

init();
