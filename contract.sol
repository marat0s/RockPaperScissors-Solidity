// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RockPaperScissors {

    address public owner;
    uint256 public betAmount = 0.0001 ether;

    enum GameState {WaitingForPlayer, WaitingForReveal, GameOver}
    enum Choice {None, Rock, Paper, Scissors}

    struct Game {
        address payable player1;
        address payable player2;
        bytes32 player1Commit;
        bytes32 player2Commit;
        Choice player1Reveal;
        Choice player2Reveal;
        GameState state;
    }

    Game public currentGame;

    modifier onlyPlayers() {
        require(msg.sender == currentGame.player1 || msg.sender == currentGame.player2, "Not a player in the current game");
        _;
    }

    modifier inState(GameState _state) {
        require(currentGame.state == _state, "Invalid game state");
        _;
    }

    event NewGame(address player1, bytes32 commit);
    event PlayerJoined(address player2, bytes32 commit);
    event Revealed(address player, Choice choice);
    event GameResult(address winner, address loser, uint256 reward);

    constructor() {
        owner = msg.sender;
        currentGame.state = GameState.WaitingForPlayer;
    }

    function startGame(bytes32 _commit) external payable {
        require(currentGame.state == GameState.WaitingForPlayer, "Game already in progress");
        require(msg.value == betAmount, "Incorrect bet amount");

        currentGame.player1 = payable(msg.sender);
        currentGame.player1Commit = _commit;

        currentGame.state = GameState.WaitingForReveal;

        emit NewGame(msg.sender, _commit);
    }

    function joinGame(bytes32 _commit) external payable inState(GameState.WaitingForReveal) {
        require(msg.value == betAmount, "Incorrect bet amount");
        require(currentGame.player2 == address(0), "Player 2 already joined");

        currentGame.player2 = payable(msg.sender);
        currentGame.player2Commit = _commit;

        emit PlayerJoined(msg.sender, _commit);
    }

    function revealChoice(Choice _choice, string memory _secret) external onlyPlayers inState(GameState.WaitingForReveal) {
        require(_choice != Choice.None, "Invalid choice");

        bytes32 computedHash = keccak256(abi.encodePacked(_choice, _secret));

        if(msg.sender == currentGame.player1) {
            require(currentGame.player1Commit == computedHash, "Invalid reveal");
            currentGame.player1Reveal = _choice;
        } else {
            require(currentGame.player2Commit == computedHash, "Invalid reveal");
            currentGame.player2Reveal = _choice;
        }

        emit Revealed(msg.sender, _choice);

        if(currentGame.player1Reveal != Choice.None && currentGame.player2Reveal != Choice.None) {
            determineWinner();
        }
    }

    function determineWinner() internal {
        Choice player1Choice = currentGame.player1Reveal;
        Choice player2Choice = currentGame.player2Reveal;

        address winner = address(0);
        address loser = address(0);
        uint256 reward = 0;

        if(player1Choice == player2Choice) {
            currentGame.player1.transfer(betAmount);
            currentGame.player2.transfer(betAmount);
        } else if ((player1Choice == Choice.Rock && player2Choice == Choice.Scissors) ||
                   (player1Choice == Choice.Paper && player2Choice == Choice.Rock) ||
                   (player1Choice == Choice.Scissors && player2Choice == Choice.Paper)) {
            winner = currentGame.player1;
            loser = currentGame.player2;
            reward = betAmount * 2;
            currentGame.player1.transfer(reward);
        } else {
            winner = currentGame.player2;
            loser = currentGame.player1;
            reward = betAmount * 2;
            currentGame.player2.transfer(reward);
        }

        emit GameResult(winner, loser, reward);

        delete currentGame;
        currentGame.state = GameState.WaitingForPlayer;
    }

    function getContractBalance() public view returns(uint256) {
        return address(this).balance;
    }

    function getChoiceCommit(Choice _choice, string memory _secret) public pure returns(bytes32) {
        return keccak256(abi.encodePacked(_choice, _secret));
    }
}
