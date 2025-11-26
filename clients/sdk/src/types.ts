export interface GameState {
  roomId: string;
  board: string[];
  currentPlayer: string;
  playerX: string;
  playerO: string | null;
  winner?: string | null;
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


export type ServerMessage = 
| UpdateBoardMessage 
| GameOverMessage
| UserJoinedMessage
| UserLeftMessage
| { action: "error"; message: string };


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


export type ClientMessage = JoinRoomMessage | MakeMoveMessage;