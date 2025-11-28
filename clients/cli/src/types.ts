export type Symbol = 'X' | 'O';
export type Winner = 'X' | 'O' | 'draw' | null;

export interface User {
  username: string;
}

export interface GameState {
  roomId: string;
  board: string[]; // length 9, '' or 'X' or 'O'
  currentPlayer: string; // username of current player?
  winner?: Winner;
}

export interface GameStartResponse {
  roomId: string;
  playerX: string;
  playerO?: string;
}

export interface GameMoveResponse {
  roomId: string;
  board: string[];
  currentPlayer: string;
  winner?: Winner;
}

export interface ErrorResponse {
  error?: string;
  message?: string;
}

export interface WSMessage {
  action: string;
  [key: string]: any;
}