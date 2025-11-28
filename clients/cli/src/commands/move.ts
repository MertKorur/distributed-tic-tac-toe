import { CommandModule } from 'yargs';
import chalk from 'chalk';
import { WSClient } from '../sdk/wsClient';

export const moveCommand: CommandModule = {
  command: 'move <position>',
  describe: 'Send a move to WS server (interactive session required)',
  builder: (yargs) => yargs.positional('position', { type: 'number' }),
  handler: async (argv) => {
    const position = argv.position as number;
    if (position < 0 || position > 8) { console.error(chalk.red('Invalid position')); return; }
    // In a real session, client instance must be shared. For CLI session, use connect command instead.
    console.log(chalk.yellow('Use "connect" command for interactive moves.'));
  }
};
