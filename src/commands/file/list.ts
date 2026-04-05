import chalk from "chalk";
import { getApiClient } from "../../api.js";
import { listFiles, handleAxiosError } from "../../utils/fileops.js";

export const fileListDefinition = {
  name: "list",
  description: "List files in a function.",
  options: [
    { name: "--function-id <id>", description: "Function ID", required: true },
  ],
  action: async (options: any) => {
    const client = await getApiClient();

    try {
      const files = await listFiles(client, options.functionId);

      if (files) {

        if (!Array.isArray(files) || files.length === 0) {
          console.log(`${chalk.yellow("!")} No files found.`);
          return;
        }

        console.log(chalk.blue("Files:"));
        console.log(chalk.gray(`${"ID".padEnd(25)} ${"Filename"}`));
        files.forEach((file: any) => {
          const id = String(file.id ?? file.name ?? "");
          console.log(`${chalk.cyan(id.padEnd(25))} ${chalk.white(file.filename || file.name)}`);
        });
        console.log(`\n${chalk.green("✓")} Found ${chalk.bgGreen.black(` ${files.length} `)} files.`);
      } else {
        console.log(`${chalk.yellow("!")} Unexpected response from server.`);
      }
    } catch (error: any) {
      handleAxiosError(error);
    }
  },
};
