// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RockPaperScissors {

    enum Move { NONE, ROCK, PAPER, SCISSORS }

    struct Player {
        bytes32 encryptedMove;
        Move move;
        bool hasRevealed;
        uint betAmount;
    }

    mapping(address => Player) public players;
    address[] public playerAddresses;
    
    uint constant REVEAL_TIMEOUT = 2 hours;
    uint public revealDeadline;
   
    function register() external payable {
    require(msg.value >= 0.0001 ether, "Bet amount too low");
    require(playerAddresses.length < 2, "Game already full");
    
    players[msg.sender].betAmount = msg.value;
    playerAddresses.push(msg.sender);
    }

    function play(bytes32 encryptedMove) external {
    require(players[msg.sender].betAmount > 0, "Player not registered");
    players[msg.sender].encryptedMove = encryptedMove;
    }

    function reveal(string memory clearMove) external {
    bytes32 encrypted = keccak256(abi.encodePacked(clearMove));
    require(players[msg.sender].encryptedMove == encrypted, "Invalid move");
    
    if(keccak256(abi.encodePacked(clearMove)) == keccak256("ROCK")) players[msg.sender].move = Move.ROCK;
    else if(keccak256(abi.encodePacked(clearMove)) == keccak256("PAPER")) players[msg.sender].move = Move.PAPER;
    else if(keccak256(abi.encodePacked(clearMove)) == keccak256("SCISSORS")) players[msg.sender].move = Move.SCISSORS;
    else revert("Invalid move");

    players[msg.sender].hasRevealed = true;
    
    if(players[playerAddresses[0]].hasRevealed && players[playerAddresses[1]].hasRevealed) revealDeadline = block.timestamp + REVEAL_TIMEOUT;
    }

    function getOutcome() view external {
    require(block.timestamp > revealDeadline, "Reveal phase not over yet");
    require(players[msg.sender].hasRevealed, "Player hasn't revealed their move");
    
    // Logic for determining the winner and sending rewards
    }

function getContractBalance() public view returns (uint) {
    return address(this).balance;
    }

function whoAmI() public view returns (uint) {
    if(msg.sender == playerAddresses[0]) return 1;
    if(msg.sender == playerAddresses[1]) return 2;
    return 0;
    }

function bothPlayed() public view returns (bool) {
    return players[playerAddresses[0]].encryptedMove != bytes32(0) && players[playerAddresses[1]].encryptedMove != bytes32(0);
    }

function bothRevealed() public view returns (bool) {
    return players[playerAddresses[0]].hasRevealed && players[playerAddresses[1]].hasRevealed;
    }

function revealTimeLeft() public view returns (uint) {
    if(revealDeadline == 0) return REVEAL_TIMEOUT;
    if(block.timestamp >= revealDeadline) return 0;
    return revealDeadline - block.timestamp;
    }

}
