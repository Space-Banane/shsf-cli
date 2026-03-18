import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const deleteStorageDefinition = {
  name: "delete",
  description: "Delete a storage.",
  options: [
    { name: "--name <name>", description: "Storage name", required: true },
  ],
  action: async (options: any) => {
    const client = await getApiClient();

    try {
      const response = await client.delete(`/api/storage/${options.name}`);

      if (response.status === 200) {
        console.log(
          `${chalk.green("✓")} Storage ${chalk.cyan(options.name)} deleted successfully!`,
        );
      } else {
        console.log(
          `${chalk.yellow("!")} Unexpected response from server: ${response.status}`,
        );
      }
    } catch (error: any) {
      if (error.response) {
        console.error(
          `${chalk.red("✗")} Failed to delete storage: ${chalk.yellow(error.response.data.message || "Unknown error")}`,
        );
      } else {
        console.error(`${chalk.red("✗")} Error: ${error.message}`);
      }
    }
  },
};
