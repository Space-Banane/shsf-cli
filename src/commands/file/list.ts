import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const fileListDefinition = {
  name: "list",
  description: "List files in a storage.",
  options: [
    { name: "--storage-id <id>", description: "Storage ID", required: true },
    { name: "--prefix <prefix>", description: "Optional path prefix filter" },
  ],
  action: async (options: any) => {
    const client = await getApiClient();

    try {
      const response = await client.get(`/api/storage/${options.storageId}/files`, {
        params: options.prefix ? { prefix: options.prefix } : undefined,
      });

      if (response.status === 200 && response.data.data) {
        const files = response.data.data;

        if (!Array.isArray(files) || files.length === 0) {
          console.log(`${chalk.yellow("!")} No files found.`);
          return;
        }

        console.log(chalk.blue("Files:"));
        files.forEach((file: any) => {
          const path = file.path || file.name || "(unknown)";
          console.log(`- ${chalk.cyan(path)}`);
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
