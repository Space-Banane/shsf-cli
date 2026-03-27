import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const fileListDefinition = {
  name: "list",
  description: "List files in a function.",
  options: [
    { name: "--function-id <id>", description: "Function ID", required: true },
  ],
  action: async (options: any) => {
    const client = await getApiClient();

    try {
      const response = await client.get(`/api/function/${options.functionId}/files`);

      if (response.status === 200 && response.data.data) {
        const files = response.data.data;

        if (!Array.isArray(files) || files.length === 0) {
          console.log(`${chalk.yellow("!")} No files found.`);
          return;
        }

        console.log(chalk.blue("Files:"));
        console.log(chalk.gray(`${"ID".padEnd(25)} ${"Filename"}`));
        files.forEach((file: any) => {
          console.log(`${chalk.cyan(file.id.padEnd(25))} ${chalk.white(file.filename)}`);
        });
        console.log(`\n${chalk.green("✓")} Found ${chalk.bgGreen.black(` ${files.length} `)} files.`);
      } else {
        console.log(`${chalk.yellow("!")} Unexpected response from server.`);
        console.log(`Status Code: ${chalk.blue(response.status)}`);
      }
    } catch (error: any) {
      if (error.response) {
        console.error(
          `${chalk.red("✗")} Failed to list files: ${chalk.yellow(error.response.data?.message || "Unknown error")}`,
        );
      } else if (error.request) {
        console.error(`${chalk.red("✗")} No response received from server.`);
      } else {
        console.error(`${chalk.red("✗")} Error: ${error.message}`);
      }
    }
  },
};
