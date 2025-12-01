import { select } from '@inquirer/prompts';
import chalk from 'chalk';
import { CHOICES, MenuAction } from './choices';

import { session } from "../state/sessionState";
import { cmdRegister } from "../commands/register";
import { cmdListRooms } from "../commands/listRooms";
import { cmdCreateRoom } from "../commands/createRoom";
import { cmdJoinRoom } from "../commands/joinRoom";
import { cmdConnect } from "../commands/connect";
import { cmdWatch } from "../commands/watch";
import { cmdMove } from '../commands/move';

export const mainMenu = async (): Promise<void> => {
    while (true) {
        printHeader();

        const action = await select<MenuAction>({
            message: "Select an option:",
            choices: CHOICES,
        });

        switch (action) {
            case "register": await cmdRegister(); break;
            case "listRooms": await cmdListRooms(); break;
            case "createRoom": await cmdCreateRoom(); break;
            case "joinRoom": await cmdJoinRoom(); break;
            case "connect": await cmdConnect(); break;
            case "move": await cmdMove(); break;
            case "watch": await cmdWatch(); break;
            case "exit":
                console.log(chalk.blue("Goodbye."));
                session.resetWS();
                process.exit(0);
        }
    }
};

const printHeader = () => {
  console.log("");
  console.log(chalk.green("=== Distributed Tic-Tac-Toe CLI ==="));
  console.log(`User: ${session.username ?? "none"}`);
  console.log(`Room: ${session.roomId ?? "none"}`);
  console.log(`Symbol: ${session.symbol ?? "none"}`);
  console.log("");
};