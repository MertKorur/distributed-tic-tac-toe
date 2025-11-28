import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { registerCommand } from '../src/commands/register';
import { createRoomCommand } from '../src/commands/createRoom';
import { listRoomsCommand } from '../src/commands/listRooms';
import { joinRoomCommand } from '../src/commands/joinRoom';
import { connectCommand } from '../src/commands/connect';
import { moveCommand } from '../src/commands/move';

yargs(hideBin(process.argv))
  .command(registerCommand)
  .command(createRoomCommand)
  .command(listRoomsCommand)
  .command(joinRoomCommand)
  .command(connectCommand)
  .command(moveCommand)
  .demandCommand()
  .strict()
  .help()
  .parse();
