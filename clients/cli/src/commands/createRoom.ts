import chalk from "chalk";
import { session } from "../state/sessionState";
import { createRoom } from "../sdk/api";

export const cmdCreateRoom = async () => {
  if (!session.username) {
    console.log(chalk.red("Register first."));
    return;
  }

  if (session.roomId) {
    console.log(chalk.red(`User ${session.username} already has active room.`))
    return;
  }

  try {
    const res = await createRoom(session.username);
    session.setRoom(res.roomId);
    session.setSymbol("X");

    console.log(chalk.green(`Created room: ${res.roomId}`));
    console.log(chalk.blue(`You're player ${session.symbol}. Use "connect" to enter the game.`));
  } catch (err: any) {
    console.log(chalk.red("Failed to create room:"), err.response?.data?.error || err.message);
  }
};
