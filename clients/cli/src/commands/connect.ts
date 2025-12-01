import chalk from "chalk";
import { session } from "../state/sessionState";
import { WSClient } from "../sdk/wsClient";
import { getGameStatus } from "../sdk/api";
import { renderBoard } from "../utils/board";

export const cmdConnect = async () => {
  if (!session.username || !session.roomId) {
    console.log(chalk.red("Register and join a room first."));
    return;
  }

  // get game status
  let symbol: "X" | "O" | null = null;

  try {
    const status: any = await getGameStatus(session.roomId)

    if (status.playerX === session.username) symbol = "X";
    else if (status.playerO === session.username) symbol = "O";

    if (!symbol) {
      console.log(chalk.red("Could not infer your symbol from backend. Room creator = X, joiner = O. Something is wrong."));
      return;
    }
  } catch (err) {
    console.log(chalk.red("Failed to fetch game status."), err);
    return;
  }

  session.symbol = symbol;

  console.log(chalk.green(`Connected as symbol: ${session.symbol}`));

  // Connect WS //
  // Reset existing connection if there is
  session.resetWS();
  const ws = new WSClient(session.roomId, session.username);
  session.ws = ws;

  ws.on("connected", () => console.log(chalk.green("WS connected.")));

  ws.on("message", (msg: any) => {
    switch (msg.action) {
      case "updateBoard":
        console.log(chalk.cyan(`Current player: ${msg.currentPlayer ?? "unknown"}`));
        renderBoard(msg.board);
        break;
      case "userJoined":
        console.log(chalk.yellow(`User joined: ${msg.player}`));
        break;
      case "userLeft":
        console.log(chalk.yellow(`User left: ${msg.player}`));
        break;
      case "gameOver":
        console.log(chalk.magenta(`Game over - winner: ${msg.winner}`));
        break;
      case "error":
        console.log(chalk.red(`Server error: ${msg.message}`));
        break;
      default:
        console.log(chalk.dim("WS:"), JSON.stringify(msg));
    }
  });

  ws.connect();

  console.log(chalk.dim(`Connected as ${session.symbol}- do "Make Move" to make move.`));
};
