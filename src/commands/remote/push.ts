import chalk from "chalk";
import { getApiClient } from "../../api.js";
import fs from "fs";
import path from "path";

export const pushDefinition = {
  name: "push",
  description: "Push files to a remote function.",
  options: [
    { name: "--id <id>", description: "Function ID", required: true },
    { name: "--from <path>", description: "Source directory", required: true },
    { name: "--force", description: "Force overwrite" },
  ],
  action: async (options: any) => {
    const client = await getApiClient();

    if (!fs.existsSync(options.from)) {
      console.error(chalk.red(`Source ${options.from} does not exist.`));
      return;
    }

    const files = fs.readdirSync(options.from).map(file => ({
      filename: file,
      content: fs.readFileSync(path.join(options.from, file), 'utf-8')
    }));

    if (!options.force && files.length > 5) {
      console.log(chalk.yellow('Too many modifications. Please use --force to confirm.'));
      return;
    }

    try {
      await client.post(`/functions/${options.id}/files`, { files });
      console.log(chalk.green(`Successfully pushed ${files.length} files to function ${options.id}`));
    } catch (error: any) {
      console.error(chalk.red(`Failed to push files: ${error.message}`));
    }
  },
};
