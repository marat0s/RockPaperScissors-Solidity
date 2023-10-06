// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RockPaperScissors {
    enum Move { None, Rock, Paper, Scissors }
    struct Player {
        bytes32 encryptedMove;
        Move move;
    }

    address payable public player1;
    address payable public player2;
    Player public player1Data;
    Player public player2Data;

    uint256 public betAmount = 0.0001 ether;
    uint256 constant REVEAL_TIMEOUT = 1 hours;
    uint256 public revealDeadline;

    modifier onlyPlayers() {
        require(msg.sender == player1 || msg.sender == player2, "Not a player");
        _;
    }

    function register() external payable {
        require(msg.value >= betAmount, "Minimum bet amount not sent");
        if (player1 == address(0)) {
            player1 = payable(msg.sender);
        } else if (player2 == address(0) && msg.sender != player1) {
            player2 = payable(msg.sender);
            revealDeadline = block.timestamp + REVEAL_TIMEOUT;
        } else {
            revert("Already two players registered");
        }
    }

    function play(bytes32 _encryptedMove) external onlyPlayers {
        require(player2 != address(0), "Second player not registered yet");
        Player storage currentPlayer = (msg.sender == player1) ? player1Data : player2Data;
        require(currentPlayer.encryptedMove == bytes32(0), "Move already made");
        currentPlayer.encryptedMove = _encryptedMove;
    }

    function reveal(string memory _move, string memory _password) external onlyPlayers {
        require(block.timestamp <= revealDeadline, "Reveal time passed");
        Player storage currentPlayer = (msg.sender == player1) ? player1Data : player2Data;

        bytes32 expectedHash = keccak256(abi.encodePacked(_move, _password));
        require(currentPlayer.encryptedMove == expectedHash, "Move does not match the encrypted one");

        if (keccak256(abi.encodePacked(_move)) == keccak256("Rock")) {
            currentPlayer.move = Move.Rock;
        } else if (keccak256(abi.encodePacked(_move)) == keccak256("Paper")) {
            currentPlayer.move = Move.Paper;
        } else if (keccak256(abi.encodePacked(_move)) == keccak256("Scissors")) {
            currentPlayer.move = Move.Scissors;
        } else {
            revert("Invalid move");
        }

        if (player1Data.move != Move.None && player2Data.move != Move.None) {
            determineWinner();
        }
    }

    function determineWinner() internal {
        int winner = checkWinner(player1Data.move, player2Data.move);
        if (winner == 0) {
            player1.transfer(betAmount);
            player2.transfer(betAmount);
        } else if (winner == 1) {
            player1.transfer(address(this).balance);
        } else {
            player2.transfer(address(this).balance);
        }

        resetGame();
    }

    function checkWinner(Move _move1, Move _move2) internal pure returns(int) {
        if (_move1 == _move2) return 0;  // Tie
        if ((_move1 == Move.Rock && _move2 == Move.Scissors) || 
            (_move1 == Move.Paper && _move2 == Move.Rock) || 
            (_move1 == Move.Scissors && _move2 == Move.Paper)) return 1;  // Player 1 wins
        return -1;  // Player 2 wins
    }

    function resetGame() internal {
        player1 = payable(address(0));
        player2 = payable(address(0));
        delete player1Data;
        delete player2Data;
    }

    // Helper functions
    function getContractBalance() external view returns(uint) {
        return address(this).balance;
    }

    function whoAmI() external view returns(int) {
        if (msg.sender == player1) return 1;
        if (msg.sender == player2) return 2;
        return 0;
    }

    function bothPlayed() external view returns(bool) {
        return player1Data.encryptedMove != bytes32(0) && player2Data.encryptedMove != bytes32(0);
    }

    function bothRevealed() external view returns(bool) {
        return player1Data.move != Move.None && player2Data.move != Move.None;
    }

    function revealTimeLeft() external view returns(uint) {
        if (block.timestamp > revealDeadline) return 0;
        return revealDeadline - block.timestamp;
    }
}
