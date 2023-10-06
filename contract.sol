// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RockPaperScissors {
    address public player1;
    address public player2;
    bytes32 public player1EncryptedMove;
    bytes32 public player2EncryptedMove;
    string public player1Move;
    string public player2Move;
    uint256 public player1Bet;
    uint256 public player2Bet;
    uint256 public constant MIN_BET = 0.0001 ether;
    uint256 public constant REVEAL_TIMEOUT = 1 hours; // or any desired time
    uint256 public revealDeadline;

    enum GameState { WaitingForPlayers, WaitingForMoves, WaitingForReveal, GameOver }
    GameState public state = GameState.WaitingForPlayers;

    modifier inState(GameState _state) {
        require(state == _state, "Invalid game state.");
        _;
    }

    modifier onlyPlayers() {
        require(msg.sender == player1 || msg.sender == player2, "Only registered players can call this.");
        _;
    }

    function register() external payable inState(GameState.WaitingForPlayers) {
        require(msg.value >= MIN_BET, "Bet amount is less than minimum required.");
        if (player1 == address(0)) {
            player1 = msg.sender;
            player1Bet = msg.value;
        } else if (player2 == address(0) && msg.sender != player1) {
            player2 = msg.sender;
            player2Bet = msg.value;
            state = GameState.WaitingForMoves;
        } else {
            revert("Invalid registration.");
        }
    }

    function play(bytes32 encrMove) external onlyPlayers inState(GameState.WaitingForMoves) {
        if (msg.sender == player1) {
            player1EncryptedMove = encrMove;
        } else {
            player2EncryptedMove = encrMove;
        }

        if (player1EncryptedMove != bytes32(0) && player2EncryptedMove != bytes32(0)) {
            state = GameState.WaitingForReveal;
            revealDeadline = block.timestamp + REVEAL_TIMEOUT;
        }
    }

    function reveal(string memory clearMove, string memory password) external onlyPlayers inState(GameState.WaitingForReveal) {
        require(block.timestamp <= revealDeadline, "Reveal time is over.");
        bytes32 moveHash = keccak256(abi.encodePacked(clearMove, password));
        if (msg.sender == player1 && moveHash == player1EncryptedMove) {
            player1Move = clearMove;
        } else if (msg.sender == player2 && moveHash == player2EncryptedMove) {
            player2Move = clearMove;
        } else {
            revert("Invalid move or password.");
        }

        if (bytes(player1Move).length > 0 && bytes(player2Move).length > 0) {
            state = GameState.GameOver;
            // Determine winner and distribute rewards
            getOutcome();
        }
    }

    function getOutcome() internal inState(GameState.GameOver) {
        // Logic to determine winner based on player1Move and player2Move
        // Distribute rewards accordingly
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
        return player1EncryptedMove != bytes32(0) && player2EncryptedMove != bytes32(0);
    }

    function bothRevealed() external view returns (bool) {
        return bytes(player1Move).length > 0 && bytes(player2Move).length > 0;
    }

    function revealTimeLeft() external view returns (uint256) {
        if (block.timestamp > revealDeadline) return 0;
        return revealDeadline - block.timestamp;
    }
}
