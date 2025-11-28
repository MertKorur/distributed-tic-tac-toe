import { CommandModule } from 'yargs';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { WSClient } from '../sdk/wsClient';
import { WSMessage } from '../types';

const renderBoard = (board: string[]) => {
  console.log('');
  for (let i = 0; i < 3; i++) {
    console.log(board.slice(i * 3, i * 3 + 3).map((v, idx) => v || idx + i*3).join(' | '));
    if (i < 2) console.log('---------');
  }
  console.log('');
};

export const connectCommand: CommandModule = {
  command: 'connect',
  describe: 'Connect to WS and interactively play',
  builder: (yargs) =>
    yargs
      .option('room', { type: 'string', demandOption: true })
      .option('username', { type: 'string', demandOption: true }),
  handler: async (argv) => {
    const roomId = argv.room as string;
    const username = argv.username as string;
    const wsUrl = process.env.WS_SERVER_URL || "ws://localhost:8080";
    const client = new WSClient(roomId, username, wsUrl);
    client.connect();

    client.on('connected', () => console.log(chalk.green('Connected to game server')));
    client.on('message', async (msg: WSMessage) => {
      switch (msg.action) {
        case 'updateBoard':
          renderBoard(msg.board);
          console.log(chalk.cyan(`Current player: ${msg.currentPlayer}`));
          if (msg.winner) console.log(chalk.green(`Game over! Winner: ${msg.winner}`));
          break;
        case 'userJoined':
          console.log(chalk.yellow(`${msg.player} joined`));
          break;
        case 'userLeft':
          console.log(chalk.yellow(`${msg.player} left`));
          break;
        case 'gameOver':
          console.log(chalk.green(`Game over! Winner: ${msg.winner}`));
          break;
        case 'error':
          console.log(chalk.red(`Error: ${msg.message}`));
          break;
      }
    });

    while (true) {
      const answers = await inquirer.prompt<{ position: string }>([{
        type: 'input', // <--- required type
        name: 'position',
        message: 'Enter position (0-8) or "q" to quit',
        validate: (v: string) => {
          if (v === 'q') return true;
          const n = Number(v);
          return !isNaN(n) && n >= 0 && n <= 8 ? true : 'Enter a number 0-8 or q';
        }
      }]);
      const position = answers.position;
      if (position === 'q') { client.disconnect(); break; }
      client.send({ action: 'makeMove', roomId, player: username, position: Number(position) });
    }
  }
};
