# Rock paper scissors solidity game

## How to Play

### Joining the Game

1. **Player 1** deploys the contract and becomes the first player.
2. **Player 2** joins the game by sending a transaction to the contract's `joinGame` function.

### Making a Move

Players make their moves by sending a transaction to the contract's `makeMove` function with their chosen move (Rock, Paper, or Scissors).

### Determining the Winner

Once both players have made their moves, the contract's `determineWinner` function can be called to decide the winner based on the game's rules.
