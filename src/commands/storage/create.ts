import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const createStorageDefinition = {
  name: "create",
  description: "Create a new storage.",
  options: [
    { name: "--name <name>", description: "Storage name", required: true },
    { name: "--purpose <purpose>", description: "Storage purpose", required: true },
  ],
  action: async (options: any) => {
    const data = {
      name: options.name,
      purpose: options.purpose,
    };

    const client = await getApiClient();

    try {
      const response = await client.post("/api/storage", data);

      if (response.status === 200 || response.status === 201) {
        console.log(
          `${chalk.green("✓")} Storage ${chalk.cyan(data.name)} created successfully!`,
        );
      } else {
        console.log(
          `${chalk.yellow("!")} Unexpected response from server: ${response.status}`,
        );
      }
    } catch (error: any) {
      if (error.response) {
        console.error(
          `${chalk.red("✗")} Failed to create storage: ${chalk.yellow(error.response.data.message || "Unknown error")}`,
        );
      } else {
        console.error(`${chalk.red("✗")} Error: ${error.message}`);
      }
    }
  },
};
