import { Command } from 'commander';
import ingestCommand from './commands/ingest.js';
import askCommand from './commands/ask.js';
import reindexCommand from './commands/reindex.js';

const program = new Command();

program
  .name('rag')
  .description('Advanced RAG Course Assistant CLI')
  .version('1.0.0');

program
  .command('ingest')
  .description('Parse, chunk, embed, and store course transcripts')
  .action(ingestCommand);

import chatCommand from './commands/chat.js';

program
  .command('chat')
  .description('Start an interactive chat session')
  .action(chatCommand);

program
  .command('ask')
  .description('Ask a question to the course assistant')
  .argument('<question...>', 'The question to ask')
  .action((questionParts) => askCommand(questionParts.join(' ')));

program
  .command('reindex')
  .description('Wipe vector DB and re-ingest all data')
  .action(reindexCommand);

program.parse(process.argv);