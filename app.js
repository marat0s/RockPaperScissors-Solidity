const web3 = new Web3(window.ethereum);

async function init() {
    await window.ethereum.enable();

    const contractAddress = "0x41A4F119dAe0ef9C48452cDAAcc4a057D7ccf3AF"; // Replace with your contract's address
    const abi = [
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
				"name": "clearMove",
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
		"name": "getOutcome",
		"outputs": [],
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
		"name": "playerAddresses",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
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
				"internalType": "bool",
				"name": "hasRevealed",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "betAmount",
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
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]; // Replace with your contract's ABI (available in Remix after compiling)

    const contract = new web3.eth.Contract(abi, contractAddress);
    const accounts = await web3.eth.getAccounts();

    document.getElementById('register').addEventListener('click', async () => {
        const response = await contract.methods.register().send({ from: accounts[0], value: web3.utils.toWei("0.0001", "tbnb") });
        console.log(response);
    });

    document.getElementById('play').addEventListener('click', async () => {
        const move = document.getElementById('move').value;
        const passphrase = document.getElementById('passphrase').value;
        const combinedString = move + passphrase;

        const encryptedMove = web3.utils.sha3(combinedString);

        const response = await contract.methods.play(encryptedMove).send({ from: accounts[0] });
        console.log(response);
    });

    document.getElementById('reveal').addEventListener('click', async () => {
        const move = document.getElementById('move').value;
        const passphrase = document.getElementById('passphrase').value;
        const combinedString = move + passphrase;

        const response = await contract.methods.reveal(combinedString).send({ from: accounts[0] });
        console.log(response);
    });

    document.getElementById('outcome').addEventListener('click', async () => {
        const outcome = await contract.methods.getOutcome().call({ from: accounts[0] });
        console.log(outcome);
    });

    async function updateContractBalance() {
        const balance = await contract.methods.getContractBalance().call();
        document.getElementById('contractBalance').innerText = `Contract Balance: ${web3.utils.fromWei(balance, 'tbnb')} tBNB`;
    }

    async function updatePlayerID() {
        const id = await contract.methods.whoAmI().call({ from: accounts[0] });
        document.getElementById('playerID').innerText = `Your Player ID: ${id}`;
    }

    async function updatePlayedStatus() {
        const status = await contract.methods.bothPlayed().call();
        document.getElementById('playedStatus').innerText = `Both Played: ${status}`;
    }

    async function updateRevealedStatus() {
        const status = await contract.methods.bothRevealed().call();
        document.getElementById('revealedStatus').innerText = `Both Revealed: ${status}`;
    }

    async function updateRevealTime() {
        const time = await contract.methods.revealTimeLeft().call();
        document.getElementById('revealTime').innerText = `Reveal Time Left: ${time} seconds`;
    }

    function updateGameState() {
        updateContractBalance();
        updatePlayerID();
        updatePlayedStatus();
        updateRevealedStatus();
        updateRevealTime();
    }

    document.getElementById('updateState').addEventListener('click', updateGameState);

    // Update the game state at regular intervals (e.g., every 10 seconds):
    setInterval(updateGameState, 10000);

}

init();
