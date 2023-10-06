// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RockPaperScissors {
    enum Move { None, Rock, Paper, Scissors }
    struct Player {
        bytes32 encryptedMove;
        Move move;
        address payable addr;
    }

    Player[2] public players;
    uint256 public numPlayers = 0;
    uint256 public REVEAL_TIMEOUT = 3 minutes; // Change as desired
    uint256 public revealDeadline;

    event PlayerRegistered(address player);
    event MoveMade(address player);
    event GameFinished(address winner, uint256 reward);

    function register() public payable {
        require(msg.value == 0.0001 ether, "Send exact amount");
        require(numPlayers < 2, "Game is full");
        players[numPlayers].addr = payable(msg.sender);
        numPlayers++;
        emit PlayerRegistered(msg.sender);
    }

    function play(bytes32 encryptedMove) public {
        require(numPlayers == 2, "Game is not full");
        require(encryptedMove != 0, "Invalid move");
        for(uint8 i = 0; i < 2; i++) {
            if(players[i].addr == msg.sender) {
                players[i].encryptedMove = encryptedMove;
                emit MoveMade(msg.sender);
                return;
            }
        }
    }

    function reveal(Move move, string memory password) public {
        require(block.timestamp < revealDeadline, "Reveal phase is over");
        for(uint8 i = 0; i < 2; i++) {
            if(players[i].addr == msg.sender) {
                require(players[i].encryptedMove == keccak256(abi.encodePacked(move, password)), "Invalid move or password");
                players[i].move = move;
            }
        }
        if(players[0].move != Move.None && players[1].move != Move.None) {
            determineWinner();
        }
    }

    function determineWinner() private {
        Move[3] memory winningMoves = [Move.Scissors, Move.Rock, Move.Paper];
        if(players[0].move == players[1].move) {
            players[0].addr.transfer(0.00005 ether);
            players[1].addr.transfer(0.00005 ether);
            emit GameFinished(address(0), 0);
        } else if (winningMoves[uint8(players[0].move) - 1] == players[1].move) {
            players[0].addr.transfer(0.0001 ether);
            emit GameFinished(players[0].addr, 0.0001 ether);
        } else {
            players[1].addr.transfer(0.0001 ether);
            emit GameFinished(players[1].addr, 0.0001 ether);
        }
        delete players;
        numPlayers = 0;
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function whoAmI() public view returns (uint8) {
        if (players[0].addr == msg.sender) return 1;
        if (players[1].addr == msg.sender) return 2;
        return 0;
    }

    function bothPlayed() public view returns (bool) {
        return players[0].encryptedMove != 0 && players[1].encryptedMove != 0;
    }

    function bothRevealed() public view returns (bool) {
        return players[0].move != Move.None && players[1].move != Move.None;
    }

    function revealTimeLeft() public view returns (uint256) {
        if(block.timestamp > revealDeadline) return 0;
        return revealDeadline - block.timestamp;
    }
}
