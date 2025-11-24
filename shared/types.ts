export interface User {
  id: number;
  username: string;
}

export interface GameState {
  roomId: string;
  board: string[];
  currentPlayer: string; // username of the current player
  playerX: string; // username of player X
  playerO: string | null; // username of player O
  winner?: string | null; // "X", "O", "draw", or null
}

export interface GameStartResponse {
  message: string;
  board: string[];
}

export interface GameMoveResponse {
  board: string[];
  currentPlayer: string; // username
  winner?: string | null; // "X", "O", "draw", or null
}

export interface ErrorResponse {
  error: string;
}

// WebSocket message types

// player = username
export interface JoinRoomMessage {
  action: "joinRoom";
  roomId: string;
  player: string; // username
}

// player = symbol
export interface MakeMoveMessage {
  action: "makeMove";
  roomId: string;
  player: "X" | "O"; // symbol
  position: number; // 0-8
}

export interface UpdateBoardMessage {
  action: "updateBoard";
  board: string[];
  currentPlayer: string; // username
  winner?: string | null; // "X", "O", "draw", or null
}

export interface GameOverMessage {
  action: "gameOver";
  winner: string | null; // "X", "O", "draw", or null
}

export interface UserJoinedMessage {
  action: "userJoined";
  player: string; // username
}

export interface UserLeftMessage {
  action: "userLeft";
  player: string; // username
}

export interface JoinedRoomMessage {
  action: "joinedRoom";
  roomId: string;
}

export interface ErrorMessage {
  action: "error";
  message: string;
}

// Union types for messages
export type ClientMessage = JoinRoomMessage | MakeMoveMessage;
export type ServerMessage = 
| UpdateBoardMessage 
| ErrorMessage
| UserJoinedMessage
| UserLeftMessage
| GameOverMessage
| JoinedRoomMessage;