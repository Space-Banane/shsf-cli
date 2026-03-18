import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const createTriggerDefinition = {
  name: "trigger",
  description: "Create a new trigger for a function.",
  options: [
    { name: "--function-id <id>", description: "The ID of the function to add the trigger to", required: true },
    { name: "--name <name>", description: "Trigger name", required: true },
    { name: "--description <description>", description: "Trigger description", required: true },
  ],
  action: async (options: any) => {
    const { functionId, name, description } = options;

    const data = {
      name,
      description,
    };

    const client = await getApiClient();

    try {
      const response = await client.post(`/api/functions/${functionId}/triggers`, data);

      if (response.status === 200 || response.status === 201) {
        console.log(
          `${chalk.green("✓")} Trigger ${chalk.cyan(name)} created successfully for function ID ${chalk.cyan(functionId)}! ID: ${chalk.bgGreen.black(` ${response.data.data.id} `)}`,
        );
      } else {
        console.log(
          `${chalk.yellow("!")} Unexpected response from server: ${response.status}`,
        );
      }
    } catch (error: any) {
      if (error.response) {
        console.error(
          `${chalk.red("✗")} Failed to create trigger: ${chalk.yellow(error.response.data.message || "Unknown error")}`,
        );
      } else {
        console.error(`${chalk.red("✗")} Error: ${error.message}`);
      }
    }
  },
};
