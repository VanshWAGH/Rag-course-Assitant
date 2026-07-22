import chalk from 'chalk';

export const logger = {
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  warn: (msg) => console.warn(chalk.yellow('⚠'), msg),
  error: (msg, err) => {
    console.error(chalk.red('✖'), msg);
    if (err) console.error(chalk.red(err.stack || err));
  },
  step: (step, msg) => console.log(chalk.cyan(`[${step}]`), chalk.bold(msg)),
  success: (msg) => console.log(chalk.green('✔'), msg)
};