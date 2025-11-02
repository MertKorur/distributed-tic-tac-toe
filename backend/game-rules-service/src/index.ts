import express, { Request, Response } from 'express';
import { WebSocketServer } from 'ws';
import { errorHandler } from "./middleware/errorHandler";
import { CONFIG } from "./config";


const app = express();
app.use(express.json());
app.use(errorHandler);


let games: Record<string, { board: string[]; currentPlayer: string }> = {};

app.post("/game/start", (req: Request, res: Response) => {
  const { roomId, playerX, playerO } = req.body;
  
  games[roomId] = {
    board: Array(9).fill(null),
    currentPlayer: playerX,
  };

  res.json({ message: `Game started for room ${roomId}`, board: games[roomId].board });
});

app.post("/game/move", (req: Request, res: Response) => {
  const { roomId, player, position } = req.body;
  const game = games[roomId];

  if (!game) return res.status(404).json({ error: "Game not found" });
  if (game.board[position]) return res.status(400).json({ error: "Position already taken" });
  if (game.currentPlayer !== player) return res.status(400).json({ error: "Not your turn" });

  game.board[position] = player === "X" ? "X" : "O";
  game.currentPlayer = player === "X" ? "O" : "X";

  const winner = checkWin(game.board);
  res.json({ 
    board: game.board, 
    currentPlayer: game.currentPlayer,
    winner: winner || null
  });
});


app.get("/", (req: Request, res: Response) => {
  res.send(`${CONFIG.SERVICE_NAME} is running`);
});

app.listen(CONFIG.PORT, () => {
  console.log(`${CONFIG.SERVICE_NAME} running on port ${CONFIG.PORT}`);
});


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