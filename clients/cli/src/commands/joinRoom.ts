import { input } from "@inquirer/prompts";
import chalk from "chalk";
import { session } from "../state/sessionState";
import { joinGame } from "../sdk/api";

export const cmdJoinRoom = async () => {
  if (!session.username) {
    console.log(chalk.red("Register first."));
    return;
  }

  const roomId = await input({ message: "Enter room ID:" });

  if (!roomId) {
    console.log(chalk.red("Room ID required."));
    return;
  }

  try {
    await joinGame(roomId, session.username);
    session.roomId = roomId;
    console.log(chalk.green(`Joined room: ${roomId}`));
  } catch (err: any) {
    console.log(chalk.red("Join failed:"), err.message);
  }
};
