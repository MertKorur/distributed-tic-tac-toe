import chalk from "chalk";
import { session } from "../state/sessionState";
import { WSClient } from "../sdk/wsClient";
import { getGameStatus } from "../sdk/api";
import { renderBoard } from "../utils/board";

export const cmdConnect = async () => {
  if (!session.username) {
    console.log(chalk.red("Register and join a room first."));
    return;
  }

  if (!session.roomId) {
    console.log(chalk.red("Join or create a room first."));
    return;
  }

  if (!session.symbol) {
    console.log(chalk.red("Symbol missing. Creator = X, Joiner = O."));
    return;
  }

  let status: any;
  try {
    status = await getGameStatus(session.roomId)
  } catch (err: any) {
    console.log(
      chalk.red("Failed to fetch game status:"), 
      chalk.dim(err?.response?.data?.error || err?.message || "Unknown error")
    );
    return;
  }

  if (status.playerX === session.username) session.symbol = "X";
  else if (status.playerO === session.username) session.symbol = "O";
  else {
    console.log(chalk.red("Could not resolve your symbol from backend. Room creator = X, joiner = O. Something is wrong."));
    return;
  }

  if (!Array.isArray(status.board) || status.board.length !== 9) {
    console.log(chalk.red("Invalid game state received from backend."));
    return;
  }

  console.log(chalk.green(`Connected as symbol: ${session.symbol} in room: ${session.roomId}`));

  // Connect WS //
  // Reset existing connection if there is
  try {
    session.resetWS();

    const ws = new WSClient(session.roomId, session.username);
    session.setWS(ws);

    let gameActive = true;

    ws.on("connected", () => console.log(chalk.green("[WS] connected.")));

    ws.on("message", async (msg: any) => {
      if (!msg?.action) {
        console.log(chalk.red("[WS] Malformed message."), msg);
        return;
      }

      
      switch (msg.action) {
        case "joinedRoom":
          console.log(chalk.green(`Joined room via WS: ${msg.roomId}`));
          break;

        case "updateBoard":
          if (!gameActive) return;
          console.log(chalk.cyan(`Current player: ${msg.currentPlayer}`));
          renderBoard(msg.board);
          break;

        case "userJoined":
          console.log(chalk.yellow(`User joined: ${msg.player}`));
          break;

        case "userLeft":
          console.log(chalk.yellow(`User left: ${msg.player}`));
          break;

        case "gameOver":
          gameActive = false;
          console.log(chalk.magenta(`Game over - winner: ${msg.winner}`));
          console.log(chalk.magenta(`Do "back" to return to main menu.`));

          try {
            ws.disconnect();
          } catch {}

          session.setRoom(null);
          session.setSymbol(null);
          break;

        case "error":
          console.log(chalk.red(`Server error: ${msg.message}`));
          break;
          
        default:
          console.log(chalk.dim("WS:"), JSON.stringify(msg));
      }
    });

    ws.on("error", (err: Error) => {
      console.log(chalk.red("[WS ERROR]"), err.message);
    });

    ws.on("close", () => {
      console.log(chalk.red("[WS] Connection closed."));
    });

    ws.connect();
    console.log(chalk.dim(`Connected as ${session.symbol}. Do "Make Move".`));
  } catch (err: any) {
    console.log(chalk.red("Failed to initialize WebSocket."), err?.message);
  }
};
