export interface User {
  id: number;
  username: string;
}

export interface GameState {
  board: string[];
  currentPlayer: string;
  winner?: string | null;
}
