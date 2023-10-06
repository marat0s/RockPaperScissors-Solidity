const contractAddress = '0xfe38EE6135e8CB7fA8201eCf7ab45fffe4152ADe'; // Replace with your deployed contract address
const abi = [
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

let web3 = new Web3(Web3.givenProvider);
let contract = new web3.eth.Contract(abi, contractAddress);

async function startGame() {
    const choice = document.getElementById("playerChoice").value;
    const secret = document.getElementById("secretString").value;

    const hash = await contract.methods.getChoiceCommit(choice, secret).call();

    const accounts = await web3.eth.getAccounts();
    await contract.methods.startGame(hash).send({
        from: accounts[0],
        value: web3.utils.toWei('0.0001', 'ether')
    });
    document.getElementById("results").innerText = "Game started!";
}

async function joinGame() {
    const choice = document.getElementById("playerChoice").value;
    const secret = document.getElementById("secretString").value;

    const hash = await contract.methods.getChoiceCommit(choice, secret).call();

    const accounts = await web3.eth.getAccounts();
    await contract.methods.joinGame(hash).send({
        from: accounts[0],
        value: web3.utils.toWei('0.0001', 'ether')
    });
    document.getElementById("results").innerText = "Joined game!";
}

async function revealChoice() {
    const choice = document.getElementById("playerChoice").value;
    const secret = document.getElementById("secretString").value;

    const accounts = await web3.eth.getAccounts();
    await contract.methods.revealChoice(choice, secret).send({ from: accounts[0] });
    document.getElementById("results").innerText = "Choice revealed!";
}

contract.events.GameResult({}, (error, event) => {
    if (error) console.error(error);
    const winner = event.returnValues.winner;
    const reward = web3.utils.fromWei(event.returnValues.reward, 'ether');
    document.getElementById("results").innerText = `${winner} won ${reward} tBNB!`;
});
