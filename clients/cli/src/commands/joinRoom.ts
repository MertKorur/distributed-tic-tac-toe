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

  // prompt
  const roomId = await input({ message: "Enter room ID:" });

  if (!roomId || roomId.trim().length === 0) {
    console.log(chalk.red("Room ID required."));
    return;
  }

  // attempt join
  try {
    const res = await joinGame(roomId, session.username);

    if (res.players?.length >= 2) {
      console.log(chalk.red("Room already has 2 players. Spectate not implemented yet."));
      return;
    }

    if (!res.symbol) {
      console.log(chalk.red("Server did not assign symbol."));
      return;
    }

    session.roomId = roomId;
    session.symbol = res.symbol;

    console.log(chalk.green(`Joined room: ${roomId} as ${res.symbol}`));
  } catch (err: any) {
    session.roomId = null;
    session.symbol = null;

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
    }

    console.log(chalk.red("Join failed:"), err.message);
  }
};
