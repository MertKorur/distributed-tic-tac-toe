import chalk from "chalk";
import { input } from "@inquirer/prompts";
import { session } from "../state/sessionState";

export const cmdMove = async () => {
  if (!session.username || !session.roomId) {
    console.log(chalk.red("You must register and join a room."));
    return;
  }

  if (!session.ws) {
    console.log(chalk.red("Not connected to WebSocket."));
    return;
  }

  if (!session.symbol) {
    console.log(chalk.red("You must pick a symbol first. Run: Connect"));
    return;
  }

  while (true) {
    const mv = await input({ message: 'Move (0-8 or "back"):' });

    if (mv === "back") break;

    const pos = Number(mv);
    if (Number.isNaN(pos) || pos < 0 || pos > 8) {
      console.log(chalk.red("Invalid move."));
      continue;
    }

    try {
      session.ws.send({
        action: "makeMove",
        roomId: session.roomId,
        player: session.symbol,
        position: pos,
      });

      console.log(chalk.green(`Sent ${session.symbol} to ${pos}`));
    } catch (err: any) {
      console.log(chalk.red("Failed to send move:"), err.message ?? err);
    }
  }
};
