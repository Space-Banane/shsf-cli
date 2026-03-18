#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { resolveCommands } from './commands.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pckg = require('../package.json');

export const program = new Command();

program
  .name('shsf')
  .description('SHSF CLI tool to manage your serverless functions.')
  .version(pckg.version);

await resolveCommands();

program
  .on('command:*', () => {
    console.error(chalk.red(`\nInvalid command: ${program.args.join(' ')}\n`));
    process.exit(1);
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
