import { CommandModule } from 'yargs';
import chalk from 'chalk';
import { registerUser, getUser } from '../sdk/api';

export const registerCommand: CommandModule = {
  command: 'register <username>',
  describe: 'Register or ensure user exists',
  builder: (yargs) =>
    yargs.positional('username', { type: 'string', describe: 'Your username' }),
  handler: async (argv) => {
    const username = argv.username as string;
    try {
      const existing = await getUser(username);
      if (existing) console.log(chalk.yellow(`User exists: ${username}`));
      else {
        await registerUser(username);
        console.log(chalk.green(`User registered: ${username}`));
      }
    } catch (err: any) {
      if (err.response?.status === 400) {
        console.error(chalk.red('Invalid username. Please choose a valid one.'));
        return;
      }
      const message = err.message || String(err);
      console.error(chalk.red('Failed to register user:'), message);
    }
  },
};
