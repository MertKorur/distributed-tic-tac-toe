import { CommandModule } from 'yargs';
import chalk from 'chalk';
import { createRoom } from '../sdk/api';

export const createRoomCommand: CommandModule = {
  command: 'create-room',
  describe: 'Create a new room as Player X',
  builder: (yargs) => yargs.option('username', { type: 'string', demandOption: true }),
  handler: async (argv) => {
    const username = argv.username as string;
    try {
      const room = await createRoom(username);
      console.log(chalk.green(`Room created. Room ID: ${room.roomId}`));
    } catch (err: any) {
      console.error(chalk.red('Failed to create room:'), err.message);
    }
  }
};
