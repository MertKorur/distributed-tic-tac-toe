export interface User {
  id: number;
  username: string;
}

export interface GameState {
  roomId: string;
  board: string[];
  currentPlayer: string;
  playerX: string;
  playerO: string;
  winner?: string | null;
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

// WebSocket message types
export interface JoinRoomMessage {
  action: "joinRoom";
  roomId: string;
  player: string;
}

export interface MakeMoveMessage {
  action: "makeMove";
  roomId: string;
  player: string;
  position: number;
}

export interface UpdateBoardMessage {
  action: "updateBoard";
  board: string[];
  currentPlayer: string;
  winner?: string | null;
}

export type ClientMessage = JoinRoomMessage | MakeMoveMessage;
export type ServerMessage = UpdateBoardMessage | { action: "error"; message: string } | { action: "joinedRoom"; roomId: string };