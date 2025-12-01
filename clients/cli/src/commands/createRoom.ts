import chalk from "chalk";
import { session } from "../state/sessionState";
import { createRoom } from "../sdk/api";

export const cmdCreateRoom = async () => {
  if (!session.username) {
    console.log(chalk.red("Register first."));
    return;
  }

  try {
    const room = await createRoom(session.username);

    session.roomId = room.roomId;
    session.symbol = "X";

    console.log(chalk.green(`Created room: ${room.roomId}`));
    console.log(chalk.blue(`You're player ${session.symbol}. Use "connect" to enter the game.`));
  } catch (err: any) {
    session.roomId = null;
    session.symbol = null;

    if (err.response) {
      console.log(chalk.red(`Failed to create room:${err.response.data?.error}`));
      return;
    }
    console.log(chalk.red("Failed to create room:"), err.message);
  }
};
