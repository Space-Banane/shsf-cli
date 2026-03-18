import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const updateTriggerDefinition = {
  name: "trigger <functionId> <triggerId>",
  description: "Update an existing trigger for a function.",
  options: [
    { name: "--name <name>", description: "Trigger name" },
    { name: "--description <description>", description: "Trigger description" },
    { name: "--cron <cron>", description: "Cron expression" },
    { name: "--enabled <enabled>", description: "Whether the trigger is enabled (true/false)" },
    { name: "--data <data>", description: "Optional trigger payload data" },
  ],
  action: async (functionId: string, triggerId: string, options: any) => {
    let parsedEnabled: boolean | undefined;
    if (options.enabled !== undefined) {
      const normalized = String(options.enabled).toLowerCase();
      if (normalized !== "true" && normalized !== "false") {
        console.error(`${chalk.red("✗")} Invalid value for --enabled. Use true or false.`);
        return;
      }
      parsedEnabled = normalized === "true";
    }

    const data: Record<string, any> = {};

    if (options.name !== undefined) data.name = options.name;
    if (options.description !== undefined) data.description = options.description;
    if (options.cron !== undefined) data.cron = options.cron;
    if (parsedEnabled !== undefined) data.enabled = parsedEnabled;
    if (options.data !== undefined) data.data = options.data;

    if (Object.keys(data).length === 0) {
      console.error(`${chalk.red("✗")} No update fields provided. Use --help to see available options.`);
      return;
    }

    const client = await getApiClient();

    try {
      const response = await client.patch(`/api/functions/${functionId}/triggers/${triggerId}`, data);

      if (response.status === 200) {
        console.log(
          `${chalk.green("✓")} Trigger with ID ${chalk.cyan(triggerId)} for function ${chalk.cyan(functionId)} updated successfully.`,
        );
      } else {
        console.log(`${chalk.yellow("!")} Unexpected response from server: ${response.status}`);
      }
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 404) {
          console.error(`${chalk.red("✗")} Trigger or function not found.`);
        } else {
          console.error(
            `${chalk.red("✗")} Failed to update trigger: ${chalk.yellow(error.response.data.message || "Unknown error")}`,
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
