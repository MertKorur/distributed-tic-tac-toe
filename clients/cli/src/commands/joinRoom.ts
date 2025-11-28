import { CommandModule } from 'yargs';
import chalk from 'chalk';
import { joinGame } from '../sdk/api';

export const joinRoomCommand: CommandModule = {
  command: 'join-room',
  describe: 'Join a room as Player O',
  builder: (yargs) =>
    yargs
      .option('room', { type: 'string', demandOption: true })
      .option('username', { type: 'string', demandOption: true }),
  handler: async (argv) => {
    const roomId = argv.room as string;
    const username = argv.username as string;
    try {
      await joinGame(roomId, username);
      console.log(chalk.green(`Joined room ${roomId} as ${username}`));
    } catch (err: any) {
      console.error(chalk.red('Failed to join room:'), err.response?.data?.error || err.message);
    }
  }
};
