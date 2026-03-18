import os from 'os';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import chalk from 'chalk';
import inquirer from 'inquirer';

export interface SHSFConfig {
  SHSF_INSTANCE: string;
  SHSF_TOKEN: string;
}

const CONFIG_FILE_NAME = '.shsf_config';

export function getConfigPath(): string {
  return path.join(os.homedir(), CONFIG_FILE_NAME);
}

async function promptForConfig(): Promise<SHSFConfig> {
  console.log(chalk.cyan('\nSetting up SHSF configuration...\n'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'SHSF_INSTANCE',
      message: 'Enter your SHSF instance URL (e.g., https://your-instance-api.yourdomain.com):',
      validate: (input: string) => {
        try {
          new URL(input);
          return true;
        } catch {
          return 'Please enter a valid URL (including http(s)://)';
        }
      },
    },
    {
      type: 'password',
      name: 'SHSF_TOKEN',
      message: 'Enter your SHSF access token (masked):',
      validate: (input: string) => input.trim().length > 0 || 'Token cannot be empty',
    },
  ]);

  const configContent = `# SHSF Configuration\nSHSF_INSTANCE=${answers.SHSF_INSTANCE}\nSHSF_TOKEN=${answers.SHSF_TOKEN}\n`;
  const configPath = getConfigPath();

  try {
    fs.writeFileSync(configPath, configContent);
    console.log(chalk.green(`\n✓ Configuration saved to ${configPath}\n`));
  } catch (error: any) {
    console.error(chalk.red(`\nError saving configuration: ${error.message}\n`));
    process.exit(1);
  }

  return answers as SHSFConfig;
}

export async function loadConfig(): Promise<SHSFConfig> {
  const configPath = getConfigPath();

  if (!fs.existsSync(configPath)) {
    return await promptForConfig();
  }

  const configContent = fs.readFileSync(configPath, 'utf-8');
  const parsed = dotenv.parse(configContent);

  const instance = parsed.SHSF_INSTANCE;
  const token = parsed.SHSF_TOKEN;

  if (!instance || !token) {
    console.error(chalk.yellow(`Missing required configuration in ${configPath}`));
    return await promptForConfig();
  }

  return {
    SHSF_INSTANCE: instance,
    SHSF_TOKEN: token,
  };
}
