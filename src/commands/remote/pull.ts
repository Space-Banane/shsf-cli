import chalk from "chalk";
import { getApiClient } from "../../api.js";
import fs from "fs";
import path from "path";

export const pullDefinition = {
  name: "pull",
  description: "Pull files from a remote function.",
  options: [
    { name: "--id <id>", description: "Function ID", required: true },
    { name: "--into <path>", description: "Target directory", required: true },
    { name: "--force", description: "Force overwrite" },
  ],
  action: async (options: any) => {
    const client = await getApiClient();

    try {
      const response = await client.get(`/api/function/${options.id}/files`);
      const files = response.data.data; // Expecting { name: string, content: string }[]

      if (!fs.existsSync(options.into)) {
        fs.mkdirSync(options.into, { recursive: true });
      } else if (fs.readdirSync(options.into).length > 0 && !options.force) {
        console.error(chalk.red(`Directory ${options.into} is not empty. Use --force to overwrite.`));
        return;
      }
      for (const file of files) {
        fs.writeFileSync(path.join(options.into, file.name), file.content);
      }
      console.log(chalk.green(`Successfully pulled ${files.length} files into ${options.into}`));
    } catch (error: any) {
      console.error(chalk.red(`Failed to pull files: ${error.message}`));
    }
  },
};
