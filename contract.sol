// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RockPaperScissors {
    enum Move { None, Rock, Paper, Scissors }
    struct Player {
        bytes32 encryptedMove;
        Move move;
    }

    address public player1;
    address public player2;
    mapping(address => Player) public players;
    uint256 public betAmount = 0.0001 ether; // tBNB is equivalent to ether in BSC
    uint256 public REVEAL_TIMEOUT = 3 minutes;
    uint256 public revealDeadline;

    modifier onlyPlayers() {
        require(msg.sender == player1 || msg.sender == player2, "Not a player");
        _;
    }

    function register() external payable {
        require(player1 == address(0) || player2 == address(0), "Already two players");
        require(msg.value == betAmount, "Incorrect bet amount");

        if (player1 == address(0)) {
            player1 = msg.sender;
        } else {
            player2 = msg.sender;
            revealDeadline = block.timestamp + REVEAL_TIMEOUT;
        }
    }

    function play(bytes32 _encryptedMove) external onlyPlayers {
        require(players[msg.sender].encryptedMove == bytes32(0), "Move already made");
        players[msg.sender].encryptedMove = _encryptedMove;
    }

    function reveal(Move _move, string memory _password) external onlyPlayers {
        require(block.timestamp <= revealDeadline, "Reveal phase is over");
        require(players[msg.sender].move == Move.None, "Move already revealed");
        require(keccak256(abi.encodePacked(_move, _password)) == players[msg.sender].encryptedMove, "Invalid move or password");

        players[msg.sender].move = _move;

        if (players[player1].move != Move.None && players[player2].move != Move.None) {
            determineWinner();
        }
    }

    function determineWinner() internal {
        Move player1Move = players[player1].move;
        Move player2Move = players[player2].move;

        if (player1Move == player2Move) {
            payable(player1).transfer(betAmount);
            payable(player2).transfer(betAmount);
        } else if ((player1Move == Move.Rock && player2Move == Move.Scissors) ||
                   (player1Move == Move.Paper && player2Move == Move.Rock) ||
                   (player1Move == Move.Scissors && player2Move == Move.Paper)) {
            payable(player1).transfer(betAmount * 2);
        } else {
            payable(player2).transfer(betAmount * 2);
        }

        resetGame();
    }

    function resetGame() internal {
        delete players[player1];
        delete players[player2];
        delete player1;
        delete player2;
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function whoAmI() external view returns (uint8) {
        if (msg.sender == player1) return 1;
        if (msg.sender == player2) return 2;
        return 0;
    }

    function bothPlayed() external view returns (bool) {
        return players[player1].encryptedMove != bytes32(0) && players[player2].encryptedMove != bytes32(0);
    }

    function bothRevealed() external view returns (bool) {
        return players[player1].move != Move.None && players[player2].move != Move.None;
    }

    function revealTimeLeft() external view returns (uint256) {
        if (block.timestamp > revealDeadline) return 0;
        return revealDeadline - block.timestamp;
    }
}
