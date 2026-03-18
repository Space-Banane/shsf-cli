import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const fileDeleteDefinition = {
  name: "delete",
  description: "Delete a file from a storage.",
  options: [
    { name: "--storage-id <id>", description: "Storage ID", required: true },
    { name: "--path <path>", description: "Remote file path", required: true },
  ],
  action: async (options: any) => {
    const client = await getApiClient();

    try {
      const response = await client.delete(`/api/storage/${options.storageId}/files`, {
        data: { path: options.path },
      });

      if (response.status === 200) {
        console.log(
          `${chalk.green("✓")} File ${chalk.cyan(options.path)} deleted from storage ${chalk.cyan(options.storageId)}.`,
        );
      } else {
        console.log(`${chalk.yellow("!")} Unexpected response from server: ${response.status}`);
      }
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 404) {
          console.error(`${chalk.red("✗")} File ${chalk.yellow(options.path)} not found.`);
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
