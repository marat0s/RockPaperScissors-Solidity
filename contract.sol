// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RockPaperScissors {
    enum Move { None, Rock, Paper, Scissors }
    
    struct Game {
        bytes32 player1Move;
        bytes32 player2Move;
        Move revealedMove1;
        Move revealedMove2;
        address payable player1;
        address payable player2;
        uint256 revealDeadline;
    }

    mapping(bytes32 => Game) public games;
    uint256 public REVEAL_TIMEOUT = 3 minutes;

    event GameCreated(bytes32 gameId);
    event PlayerRegistered(bytes32 gameId, address player);
    event MoveMade(bytes32 gameId, address player);
    event GameFinished(bytes32 gameId, address winner, uint256 reward);

    function createGame(bytes32 encryptedMove) public payable {
        require(msg.value == 0.0001 ether, "Send exact amount");

        bytes32 gameId = keccak256(abi.encodePacked(msg.sender, block.timestamp));
        games[gameId].player1Move = encryptedMove;
        games[gameId].player1 = payable(msg.sender);

        emit GameCreated(gameId);
    }

    function joinGame(bytes32 gameId, bytes32 encryptedMove) public payable {
        require(msg.value == 0.0001 ether, "Send exact amount");
        require(games[gameId].player2 == address(0), "Game is full");

        games[gameId].player2Move = encryptedMove;
        games[gameId].player2 = payable(msg.sender);
        games[gameId].revealDeadline = block.timestamp + REVEAL_TIMEOUT;

        emit PlayerRegistered(gameId, msg.sender);
    }

    function reveal(bytes32 gameId, Move move, string memory password) public {
        require(block.timestamp < games[gameId].revealDeadline, "Reveal phase is over");

        if(msg.sender == games[gameId].player1) {
            handlePlayer1Reveal(gameId, move, password);
        } else if(msg.sender == games[gameId].player2) {
            handlePlayer2Reveal(gameId, move, password);
        } else {
            revert("Not a player in this game");
        }

        if(games[gameId].revealedMove1 != Move.None && games[gameId].revealedMove2 != Move.None) {
            determineWinner(gameId);
        }
    }

    function handlePlayer1Reveal(bytes32 gameId, Move move, string memory password) private {
        bytes32 encrypted = keccak256(abi.encodePacked(move, password));
        require(encrypted == games[gameId].player1Move, "Invalid move or password for player 1");
        games[gameId].revealedMove1 = move;
    }

    function handlePlayer2Reveal(bytes32 gameId, Move move, string memory password) private {
        bytes32 encrypted = keccak256(abi.encodePacked(move, password));
        require(encrypted == games[gameId].player2Move, "Invalid move or password for player 2");
        games[gameId].revealedMove2 = move;
    }

    function determineWinner(bytes32 gameId) private {
        Game storage currentGame = games[gameId];
        Move player1Move = currentGame.revealedMove1;
        Move player2Move = currentGame.revealedMove2;

        if(player1Move == player2Move) {
            currentGame.player1.transfer(0.00005 ether);
            currentGame.player2.transfer(0.00005 ether);
            emit GameFinished(gameId, address(0), 0);
            return;
        }
    
        bool player1Wins = 
            (player1Move == Move.Rock && player2Move == Move.Scissors) ||
            (player1Move == Move.Paper && player2Move == Move.Rock) ||
            (player1Move == Move.Scissors && player2Move == Move.Paper);
    
        if(player1Wins) {
            currentGame.player1.transfer(0.0001 ether);
            emit GameFinished(gameId, currentGame.player1, 0.0001 ether);
        } else {
            currentGame.player2.transfer(0.0001 ether);
            emit GameFinished(gameId, currentGame.player2, 0.0001 ether);
        }

        delete games[gameId];
    }
}
