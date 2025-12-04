import { input } from "@inquirer/prompts";
import chalk from "chalk";
import { session } from "../state/sessionState";
import { joinGame } from "../sdk/api";

export const cmdJoinRoom = async () => {
  // guard
  if (!session.username) {
    console.log(chalk.red("Register first."));
    return;
  }

  if (session.roomId) {
    console.log(chalk.red(`Already in a room: ${session.roomId}`))
    return;
  }

  // prompt
  const roomId = await input({ message: "Enter room ID:" });

  if (!roomId?.trim()) {
    console.log(chalk.red("Room ID required."));
    return;
  }

  // attempt join
  try {
    const res = await joinGame(roomId, session.username);
    
    if (!res.symbol) {
      console.log(chalk.red("Server did not assign symbol. Join failed."));
      return;
    }

    session.setRoom(roomId);
    session.setSymbol(res.symbol);

    console.log(chalk.green(`Joined room: ${roomId} as ${res.symbol}`));
  } catch (err: any) {
    const status = err?.response?.status;
    const data = err?.response?.data;

    if (status === 404) {
      console.log(chalk.red(`Room "${roomId}" not found.`));
      return;
    }
    
    if (status === 400) {
      if (data?.error === "ROOM_FULL") {
        console.log(chalk.red("Room already has 2 players."));
        return;
      }
      if (data?.error === "INVALID_JOIN") {
        console.log(chalk.red("Room cannot be joined."));
        return;
      }
      if (data?.error === "ALREADY_IN_ROOM") {
        console.log(chalk.red("Already in an active room."));
        return;
      }
    }

    console.log(chalk.red("Join failed:"), err.message);
  }
};
