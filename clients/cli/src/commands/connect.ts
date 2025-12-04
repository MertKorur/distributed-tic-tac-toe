import chalk from "chalk";
import { session } from "../state/sessionState";
import { WSClient } from "../sdk/wsClient";
import { getGameStatus } from "../sdk/api";
import { renderBoard } from "../utils/board";

export const cmdConnect = async () => {
  if (!session.username || !session.roomId || !session.symbol) {
    console.log(chalk.red("Register and join a room first."));
    return;
  }

  try {
    const status: any = await getGameStatus(session.roomId)

    let resolved: "X" | "O" | null = null;
    if (status.playerX === session.username) resolved = "X";
    if (status.playerO === session.username) resolved = "O";

    if (!resolved) {
      console.log(chalk.red("Could not resolve your symbol from backend. Room creator = X, joiner = O. Something is wrong."));
      return;
    }

    session.symbol = resolved;
  } catch (err: any) {
    console.log(
      chalk.red("Failed to fetch game status:"), 
      chalk.dim(err?.response?.data?.error || err?.message || "Unknown error")
    );
    return;
  }

  console.log(chalk.green(`Connected as symbol: ${session.symbol}`));

  // Connect WS //
  // Reset existing connection if there is
  try {
    session.resetWS();
    const ws = new WSClient(session.roomId, session.username);
    session.ws = ws;

    ws.on("connected", () => console.log(chalk.green("WS connected.")));

    ws.on("message", (msg: any) => {
      if (!msg || !msg.action) {
        console.log(chalk.red("Received malformed WS message."), msg);
        return;
      }

      
      switch (msg.action) {
        case "updateBoard":
          console.log(chalk.cyan(`Current player: ${msg.currentPlayer}`));
          renderBoard(msg.board);
          if (msg.winner) console.log(chalk.yellow(`Winner: ${msg.winner}`));
          break;

        case "userJoined":
          console.log(chalk.yellow(`User joined: ${msg.player}`));
          break;

        case "userLeft":
          console.log(chalk.yellow(`User left: ${msg.player}`));
          break;

        case "gameOver":
          console.log(chalk.magenta(`Game over - winner: ${msg.winner}`));
          renderBoard(msg.board)
          break;

        case "error":
          console.log(chalk.red(`Server error: ${msg.message}`));
          break;
          
        default:
          console.log(chalk.dim("WS:"), JSON.stringify(msg));
      }
    });

    ws.on("disconnect", () => {
      console.log(chalk.red("WS disconnected."));
    });

    ws.connect();
    console.log(chalk.dim(`Connected as ${session.symbol}. Do "Make Move" to make move.`));
  } catch (err: any) {
    console.log(chalk.red("Failed to initialize WebSocket."), err?.message);
  }
};
