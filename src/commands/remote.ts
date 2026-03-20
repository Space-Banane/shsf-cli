import { Command } from 'commander';
import axios from 'axios';
import { loadConfig } from '../config.js';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

export async function action(options: any) {
  const config = await loadConfig();
  const api = axios.create({
    baseURL: config.apiBaseUrl,
    headers: { 'Authorization': `Bearer ${config.token}` }
  });

  if (options.into) {
    // PULL
    try {
      const response = await api.get(`/functions/${options.id}/files`);
      const files = response.data; // Assuming { filename: string, content: string }[]

      if (!fs.existsSync(options.into)) {
        fs.mkdirSync(options.into, { recursive: true });
      } else if (fs.readdirSync(options.into).length > 0 && !options.force) {
        console.error(chalk.red(`Directory ${options.into} is not empty. Use --force to overwrite.`));
        return;
      }

      for (const file of files) {
        fs.writeFileSync(path.join(options.into, file.filename), file.content);
      }
      console.log(chalk.green(`Successfully pulled files into ${options.into}`));
    } catch (e) {
      console.error(chalk.red('Failed to pull files'), e);
    }
  } else if (options.from) {
    // PUSH
    if (!fs.existsSync(options.from)) {
      console.error(chalk.red(`Source ${options.from} does not exist.`));
      return;
    }

    const files = fs.readdirSync(options.from).map(file => ({
      filename: file,
      content: fs.readFileSync(path.join(options.from, file), 'utf-8')
    }));

    if (!options.force) {
      console.log(chalk.yellow(`Pushing ${files.length} files. Review: ${files.map(f => f.filename).join(', ')}`));
      
      if (files.length > 5) {
        console.log(chalk.yellow('Too many modifications. Please use --force to confirm.'));
        return;
      }
    }

    try {
      await api.post(`/functions/${options.id}/files`, { files });
      console.log(chalk.green('Successfully pushed files.'));
    } catch (e) {
      console.error(chalk.red('Failed to push files'), e);
    }
  } else {
    console.error(chalk.red('Must specify --into or --from'));
  }
}

export default {
  name: 'remote',
  description: 'sync remote functions to/from local storage',
  options: [
    { name: '--id <id>', description: 'function id', required: true },
    { name: '--into <path>', description: 'target directory for pull' },
    { name: '--from <path>', description: 'source directory for push' },
    { name: '--force', description: 'force push/pull without confirmation' }
  ],
  action
};
