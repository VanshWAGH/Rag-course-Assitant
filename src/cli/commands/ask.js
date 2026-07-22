import { run } from '../../query/correctiveLoop.js';
import { logger } from '../../services/logger.js';
import chalk from 'chalk';

export default async function askCommand(question) {
  if (!question) {
    logger.error('Please provide a question.');
    return;
  }
  
  logger.info(`Asking: "${question}"`);
  
  try {
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