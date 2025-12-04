import { input } from "@inquirer/prompts";
import chalk from "chalk";
import { session } from "../state/sessionState";
import { registerUser, getUser } from "../sdk/api";

export const cmdRegister = async () => {
  if (session.username) {
    console.log(chalk.red(`Already logged in as ${session.username}.`))
    return;
  }

  const name = await input({ message: "Enter username:" });

  if (!name) {
    console.log(chalk.red("Username required."));
    return;
  }

  try {
    const existing = await getUser(name);
    if (existing) {
      session.setUser(name);
      console.log(chalk.yellow(`User already exists, logging in: ${name}`));
    } else {
      await registerUser(name);
      session.setUser(name);
      console.log(chalk.green(`User registered: ${name}`));
    }

    session.username = name;
  } catch (err: any) {
    console.log(chalk.red("Registration/login failed:"), err?.message);
  }
};
