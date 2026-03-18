import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const clearItemsDefinition = {
  name: "clear-items",
  description: "Clear all items from a storage.",
  options: [
    { name: "--name <name>", description: "Storage name", required: true },
  ],
  action: async (options: any) => {
    const client = await getApiClient();

    try {
      const response = await client.delete(`/api/storage/${options.name}/items`);

      if (response.status === 200) {
        console.log(
          `${chalk.green("✓")} All items cleared from storage ${chalk.cyan(options.name)}!`,
        );
      } else {
        console.log(
          `${chalk.yellow("!")} Unexpected response from server: ${response.status}`,
        );
      }
    } catch (error: any) {
      if (error.response) {
        console.error(
          `${chalk.red("✗")} Failed to clear items: ${chalk.yellow(error.response.data.message || "Unknown error")}`,
        );
      } else {
        console.error(`${chalk.red("✗")} Error: ${error.message}`);
      }
    }
  },
};
