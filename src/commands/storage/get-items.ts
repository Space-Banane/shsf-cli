import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const listItemsDefinition = {
  name: "get-items",
  description: "List all items in a storage.",
  options: [
    { name: "--name <name>", description: "Storage name", required: true },
  ],
  action: async (options: any) => {
    const client = await getApiClient();

    try {
      const response = await client.get(`/api/storage/${options.name}/items`);

      if (response.status === 200 && response.data.data) {
        const items = response.data.data;
        if (items.length === 0) {
          console.log(`${chalk.yellow("!")} Storage ${chalk.cyan(options.name)} is empty.`);
          return;
        }

        console.log(chalk.blue(`Items in ${chalk.cyan(options.name)}:`));
        items.forEach((item: any) => {
          console.log(`- ${chalk.cyan(item.key)}: ${JSON.stringify(item.value)}`);
        });
      } else {
        console.log(
          `${chalk.yellow("!")} Unexpected response from server: ${response.status}`,
        );
      }
    } catch (error: any) {
      if (error.response) {
        console.error(
          `${chalk.red("✗")} Failed to list items: ${chalk.yellow(error.response.data.message || "Unknown error")}`,
        );
      } else {
        console.error(`${chalk.red("✗")} Error: ${error.message}`);
      }
    }
  },
};
