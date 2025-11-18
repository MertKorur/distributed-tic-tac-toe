export interface User {
  id: number;
  username: string;
}

export interface GameState {
  roomId: string;
  board: string[];
  currentPlayer: string;
  playerX: string;
  playerO: string | null;
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

export interface GameOverMessage {
  action: "gameOver";
  winner: string | null;
}

export interface UserJoinedMessage {
  action: "userJoined";
  player: string;
}

export interface UserLeftMessage {
  action: "userLeft";
  player: string;
}

export type ClientMessage = JoinRoomMessage | MakeMoveMessage;
export type ServerMessage = 
| UpdateBoardMessage 
| { action: "error"; message: string } 
| UserJoinedMessage
| UserLeftMessage
| GameOverMessage;