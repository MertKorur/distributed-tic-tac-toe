import { GameState, GameStartResponse, GameMoveResponse, ErrorResponse } from "shared/types";

const games: Record<string, GameState> = {};

export function startGame(roomId: string, playerX: string, playerO: string): GameStartResponse {
  games[roomId] = {
    board: Array(9).fill(null),
    currentPlayer: playerX,
    playerX,
    playerO
  };

  return {
    message: `Game started for room ${roomId}`,
    board: games[roomId].board
  };
};

export function makeMove(roomId: string, player: string, position: number): GameMoveResponse | ErrorResponse {
  const game = games[roomId];

  if (!game) return { error: "Game not found" };
  if (game.board[position]) return { error: "Position already taken" };
  if (game.currentPlayer !== player) return { error: "Not your turn" };

  // Record move
  const symbol = player === game.playerX ? "X" : "O";
  game.board[position] = symbol;

  // Switch turn
  game.currentPlayer = player === game.playerX ? game.playerO : game.playerX;

  const winner = checkWin(game.board);
  return {
    board: game.board, 
    currentPlayer: game.currentPlayer,
    winner: winner || null,
  };
};

function checkWin(board: string[]): string | null {
  const lines = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  for (const [a,b,c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every(cell => cell)) return "draw";
  return null;
};