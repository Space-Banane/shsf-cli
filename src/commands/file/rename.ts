import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const fileRenameDefinition = {
  name: "rename",
  description: "Rename a file in a function.",
  options: [
    { name: "--function-id <id>", description: "Function ID", required: true },
    { name: "--file-id <id>", description: "File ID", required: true },
    { name: "--new-filename <name>", description: "New filename", required: true },
  ],
  action: async (options: any) => {
    const client = await getApiClient();

    try {
      const response = await client.patch(`/api/function/${options.functionId}/file/${options.fileId}/rename`, {
        newFilename: options.newFilename,
      });

      if (response.status === 200) {
        console.log(
          `${chalk.green("✓")} File ${chalk.cyan(options.fileId)} renamed to ${chalk.cyan(options.newFilename)} successfully.`,
        );
      } else {
        console.log(`${chalk.yellow("!")} Unexpected response from server: ${response.status}`);
      }
    } catch (error: any) {
      if (error.response) {
        console.error(
          `${chalk.red("✗")} Failed to rename file: ${chalk.yellow(error.response.data?.message || "Unknown error")}`,
        );
      } else if (error.request) {
        console.error(`${chalk.red("✗")} No response received from server.`);
      } else {
        console.error(`${chalk.red("✗")} Error: ${error.message}`);
      }
    }
  },
};
