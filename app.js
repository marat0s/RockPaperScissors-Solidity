const contractAddress = '0x6176C438186cC9f5F42aFafEE16758Ee3cc11DAd'; 
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
]; 
let web3 = new Web3(Web3.givenProvider);
let contract = new web3.eth.Contract(abi, contractAddress);

async function playGame(choice) {
    const accounts = await web3.eth.getAccounts();
    await contract.methods.play(choice).send({
        from: accounts[0],
        value: web3.utils.toWei('0.0001', 'ether')
    });
}

contract.events.Played({}, (error, event) => {
    if (error) console.error(error);
    document.getElementById('results').innerHTML = `You played ${event.returnValues.choice}`;
});

contract.events.Result({}, (error, event) => {
    if (error) console.error(error);
    document.getElementById('results').innerHTML += `<br>You won ${web3.utils.fromWei(event.returnValues.reward, 'ether')} tBNB!`;
});
