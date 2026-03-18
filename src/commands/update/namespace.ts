import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const updateNamespaceDefinition = {
  name: "namespace <id>",
  description: "Update an existing namespace.",
  options: [
    { name: "--name <name>", description: "Namespace name" },
    { name: "--description <description>", description: "Namespace description" },
  ],
  action: async (id: string, options: any) => {
    const data: Record<string, any> = {};

    if (options.name !== undefined) data.name = options.name;
    if (options.description !== undefined) data.description = options.description;

    if (Object.keys(data).length === 0) {
      console.error(`${chalk.red("✗")} No update fields provided. Use --help to see available options.`);
      return;
    }

    const client = await getApiClient();

    try {
      const response = await client.patch(`/api/namespace/${id}`, data);

      if (response.status === 200) {
        console.log(`${chalk.green("✓")} Namespace with ID ${chalk.cyan(id)} updated successfully.`);
      } else {
        console.log(`${chalk.yellow("!")} Unexpected response from server: ${response.status}`);
      }
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 404) {
          console.error(`${chalk.red("✗")} Namespace with ID ${chalk.yellow(id)} not found.`);
        } else {
          console.error(
            `${chalk.red("✗")} Failed to update namespace: ${chalk.yellow(error.response.data.message || "Unknown error")}`,
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
