import chalk from 'chalk';

export const info = (msg: string) => console.log(chalk.blue('[info]'), msg);
export const warn = (msg: string) => console.log(chalk.yellow('[warn]'), msg);
export const error = (msg: string) => console.error(chalk.red('[error]'), msg);
export const success = (msg: string) => console.log(chalk.green('[ok]'), msg);
