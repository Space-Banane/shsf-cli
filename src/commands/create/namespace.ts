import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const createNamespaceDefinition = {
  name: "namespace",
  description: "Create a new namespace.",
  options: [
    { name: "--name <name>", description: "Namespace name", required: true },
    { name: "--description <description>", description: "Namespace description", required: true },
  ],
  action: async (options: any) => {
    const data = {
      name: options.name,
      description: options.description,
    };

    const client = await getApiClient();

    try {
      const response = await client.post("/api/namespace", data);

      if (response.status === 200 || response.status === 201) {
        console.log(
          `${chalk.green("✓")} Namespace ${chalk.cyan(data.name)} created successfully! ID: ${chalk.bgGreen.black(` ${response.data.data.id} `)}`,
        );
      } else {
        console.log(
          `${chalk.yellow("!")} Unexpected response from server: ${response.status}`,
        );
      }
    } catch (error: any) {
      if (error.response) {
        console.error(
          `${chalk.red("✗")} Failed to create namespace: ${chalk.yellow(error.response.data.message || "Unknown error")}`,
        );
      } else {
        console.error(`${chalk.red("✗")} Error: ${error.message}`);
      }
    }
  },
};
