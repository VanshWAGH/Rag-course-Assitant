import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import chalk from 'chalk';
import { run } from '../../query/correctiveLoop.js';
import { logger } from '../../services/logger.js';

export default async function chatCommand() {
  console.log(chalk.bold.magenta('\n=== Welcome to the Advanced RAG Chat ==='));
  console.log(chalk.gray('Type your questions below. Type "exit" or "quit" to stop.\n'));

  const rl = readline.createInterface({ input, output });

  while (true) {
    const question = await rl.question(chalk.bold.green('You: '));
    
    if (question.trim().toLowerCase() === 'exit' || question.trim().toLowerCase() === 'quit') {
      console.log(chalk.magenta('Goodbye!'));
      break;
    }

    if (!question.trim()) continue;

    try {
      console.log(); // Blank line for spacing
      const answer = await run(question);
      
      console.log('\n' + chalk.bold.blue('--- ANSWER ---'));
      // Highlight citations in the answer
      const formattedAnswer = answer.replace(/\[(.*?)\]/g, (_, citation) => chalk.green(`[${citation}]`));
      console.log(formattedAnswer);
      console.log(chalk.bold.blue('--------------') + '\n');
    } catch (error) {
      logger.error('Failed to answer question:', error);
    }
  }

  rl.close();
}
