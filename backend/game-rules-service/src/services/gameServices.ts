import { 
  GameState, 
  GameStartResponse, 
  GameMoveResponse, 
  ErrorResponse 
} from "shared/types";

const games: Record<string, GameState> = {};

export function startGame(
  roomId: string, 
  playerX: string, 
  playerO: string | null
): GameStartResponse | ErrorResponse {

  const existing = games[roomId];
  if (existing) {
    return { error: `Game already exists for room ${roomId}` };
  }

  if (!playerX) {
    return { error: "Player X is required to start a game" };
  }

  const newGame: GameState = {
    roomId,
    board: Array(9).fill(""),
    playerX,
    playerO,
    currentPlayer: playerX,
    winner: null
  };
  
  games[roomId] = newGame;

  return {
    message: `Game started for room ${roomId}`,
    board: newGame.board,
  };
};

export function joinGame(
  roomId: string, 
  playerO: string
): GameStartResponse | ErrorResponse {
  const game = games[roomId];

  if (!game) return { error: "Game not found" };
  if (game.playerO) return { error: "Player O already joined" };
  
  game.playerO = playerO;

  return {
    message: `Player O: ${playerO} joined game in room ${roomId}`,
    board: game.board,
  };
}

export function makeMove(
  roomId: string, 
  player: string, 
  position: number
): GameMoveResponse | ErrorResponse {

  const game = games[roomId];

  if (!game) return { error: "Game not found" };
  if (game.winner) return { error: "Game has already ended" };
  if (position < 0 || position > 8) return { error: "Invalid position" };
  if (game.board[position]) return { error: "Position already taken" };
  if (game.currentPlayer !== player) return { error: "Not your turn" };

  // Record move
  const symbol = player === game.playerX ? "X" : "O";
  game.board[position] = symbol;

  // Check for win and end game if necessary
  const winner = checkWin(game.board);
  if (winner) {
    game.winner = winner;
    return {
      board: game.board, 
      currentPlayer: game.currentPlayer,
      winner,
    };
  }

  // Switch turn
  game.currentPlayer = player === game.playerX ? game.playerO! : game.playerX;

  return {
    board: game.board,
    currentPlayer: game.currentPlayer,
    winner: null
  };
}

export function getGameStatus(roomId: string): GameState | ErrorResponse {
  const game = games[roomId];
  if (!game) return { error: "Game not found" };
  return game;
}

export function deleteGame(roomId: string): { message: string } | ErrorResponse {
  const game = games[roomId];
  if (!game) return { error: "Game not found" };
  delete games[roomId];
  return { message: `Game in room ${roomId} deleted` };
}

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