import { input } from "@inquirer/prompts";
import chalk from "chalk";
import { session } from "../state/sessionState";
import { registerUser, getUser } from "../sdk/api";

export const cmdRegister = async () => {
  const name = await input({ message: "Enter username:" });

  if (!name) {
    console.log(chalk.red("Username required."));
    return;
  }

  try {
    const existing = await getUser(name);
    if (!existing) {
      await registerUser(name);
      console.log(chalk.green(`User registered: ${name}`));
    } else {
      console.log(chalk.yellow(`User already exists, logging in: ${name}`));
    }
    session.username = name;
  } catch (err: any) {
    console.log(chalk.red("Registration failed:"), err?.message);
  }
};
