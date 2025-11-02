export interface User {
  id: number;
  username: string;
}

export interface GameState {
  board: string[];
  currentPlayer: string;
  playerX: string;
  playerO: string;
}

export interface GameStartResponse {
  message: string;
  board: string[];
}

export interface GameMoveResponse {
  board: string[];
  currentPlayer: string;
  winner?: string | null;
}

export interface ErrorResponse {
  error: string;
}