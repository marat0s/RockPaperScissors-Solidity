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

const contractAddress = '0x248332034bC2C2275F0b387fCd478B5b5291917a';
const abi = [
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
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_encryptedMove",
				"type": "bytes32"
			}
		],
		"name": "play",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "player1",
		"outputs": [
			{
				"internalType": "address payable",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "player1Data",
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
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "player2",
		"outputs": [
			{
				"internalType": "address payable",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "player2Data",
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
			}
		],
		"stateMutability": "view",
		"type": "function"
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
				"internalType": "string",
				"name": "_move",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_password",
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
				"internalType": "int256",
				"name": "",
				"type": "int256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]; // TODO: Add your ABI generated from the Solidity compiler
const contract = new web3.eth.Contract(abi, contractAddress);

function initApp() {
    document.getElementById('register').addEventListener('click', register);
    document.getElementById('rock').addEventListener('click', () => playMove("Rock"));
    document.getElementById('paper').addEventListener('click', () => playMove("Paper"));
    document.getElementById('scissors').addEventListener('click', () => playMove("Scissors"));
    document.getElementById('reveal').addEventListener('click', revealMove);
    updateInfo();
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
