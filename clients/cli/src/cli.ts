import chalk from 'chalk';
import { mainMenu } from "./menu/mainMenu";
import { session } from "./state/sessionState"

export const startCLI = async () => {
  try {
    await mainMenu();
  } catch (err) {
    console.error(chalk.red("Fatal error in CLI:"), err);
    session.resetWS();
    process.exit(1);
  }
};

// If executed directly
if (require.main === module) {
  startCLI();
}
