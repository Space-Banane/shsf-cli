import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const fileDeleteDefinition = {
  name: "delete",
  description: "Delete a file from a function.",
  options: [
    { name: "--function-id <id>", description: "Function ID", required: true },
    { name: "--file-id <id>", description: "File ID (from 'file list')", required: true },
  ],
  action: async (options: any) => {
    const client = await getApiClient();

    try {
      const response = await client.delete(`/api/function/${options.functionId}/file/${options.fileId}`);

      if (response.status === 200) {
        console.log(
          `${chalk.green("✓")} File ${chalk.cyan(options.fileId)} deleted from function ${chalk.cyan(options.functionId)}.`,
        );
      } else {
        console.log(`${chalk.yellow("!")} Unexpected response from server: ${response.status}`);
      }
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 404) {
          console.error(`${chalk.red("✗")} File or Function not found.`);
        } else {
          console.error(
            `${chalk.red("✗")} Failed to delete file: ${chalk.yellow(error.response.data?.message || "Unknown error")}`,
          );
        }
      } else if (error.request) {
        console.error(`${chalk.red("✗")} No response received from server.`);
      } else {
        console.error(`${chalk.red("✗")} Error: ${error.message}`);
      }
    }
  },
};
