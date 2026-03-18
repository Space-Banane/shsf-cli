import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const deleteItemDefinition = {
  name: "delete-item",
  description: "Delete a storage item.",
  options: [
    { name: "--name <name>", description: "Storage name", required: true },
    { name: "--key <key>", description: "Item key", required: true },
  ],
  action: async (options: any) => {
    const client = await getApiClient();

    try {
      const response = await client.delete(`/api/storage/${options.name}/item/${options.key}`);

      if (response.status === 200) {
        console.log(
          `${chalk.green("✓")} Item ${chalk.cyan(options.key)} deleted from ${chalk.cyan(options.name)}!`,
        );
      } else {
        console.log(
          `${chalk.yellow("!")} Unexpected response from server: ${response.status}`,
        );
      }
    } catch (error: any) {
      if (error.response) {
        console.error(
          `${chalk.red("✗")} Failed to delete item: ${chalk.yellow(error.response.data.message || "Unknown error")}`,
        );
      } else {
        console.error(`${chalk.red("✗")} Error: ${error.message}`);
      }
    }
  },
};
