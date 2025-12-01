import chalk from "chalk";
import { listRooms } from "../sdk/api";

export const cmdListRooms = async () => {
  try {
    const rooms = await listRooms();
    console.log(chalk.cyan("Rooms:"));
    console.table(rooms);
  } catch (err: any) {
    console.log(chalk.red("Could not list rooms:"), err.message);
  }
};
