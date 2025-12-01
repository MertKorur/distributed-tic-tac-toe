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
    console.log(chalk.green(`Created room: ${room.roomId}`));
  } catch (err: any) {
    console.log(chalk.red("Failed to create room:"), err.message);
  }
};
