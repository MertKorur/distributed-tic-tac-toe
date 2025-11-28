import { CommandModule } from 'yargs';
import chalk from 'chalk';
import { listRooms } from '../sdk/api';

export const listRoomsCommand: CommandModule = {
  command: 'list-rooms',
  describe: 'List open rooms',
  handler: async () => {
    try {
      const rooms = await listRooms();
      if (!rooms.length) console.log(chalk.yellow('No open rooms.'));
      else rooms.forEach((r: any) => console.log(chalk.blue(`Room ID: ${r.roomId}`)));
    } catch (err: any) {
      console.error(chalk.red('Failed to list rooms:'), err.message);
    }
  }
};
