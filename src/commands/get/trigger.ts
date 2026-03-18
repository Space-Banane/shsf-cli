import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const getTriggerDefinition = {
  name: "trigger <functionId> <triggerId>",
  description: "Get detail of a specific trigger from a function.",
  action: async (functionId: string, triggerId: string) => {
    await getTrigger(functionId, triggerId);
  },
};

async function getTrigger(functionId: string, triggerId: string) {
  const client = await getApiClient();

  try {
    const response = await client.get(`/api/functions/${functionId}/triggers/${triggerId}`);

    if (response.status === 200 && response.data.data) {
      const t = response.data.data;
      
      console.log(chalk.blue.bold(`\nTrigger Details: ${t.name} (${t.id})`));
      console.log(`${chalk.gray("-------------------------------------------")}`);
      console.log(`${chalk.yellow("Name:")}        ${t.name}`);
      console.log(`${chalk.yellow("ID:")}          ${t.id}`);
      console.log(`${chalk.yellow("Description:")} ${t.description || chalk.gray("No description")}`);
      console.log(`${chalk.yellow("Cron:")}        ${chalk.cyan(t.cron)}`);
      console.log(`${chalk.yellow("Enabled:")}     ${t.enabled ? chalk.green("Yes") : chalk.red("No")}`);
      console.log(`${chalk.yellow("Function ID:")} ${t.functionId}`);
      
      if (t.nextRun) {
        console.log(`${chalk.yellow("Next Run:")}    ${new Date(t.nextRun).toLocaleString()}`);
      }
      
      if (t.data) {
        console.log(`${chalk.yellow("Data:")}        ${t.data}`);
      }

      console.log(`${chalk.gray("-------------------------------------------")}\n`);
      
    } else {
      console.log(
        `${chalk.yellow("!")} Unexpected response from server.`,
      );
      console.log(`Status Code: ${chalk.blue(response.status)}`);
    }
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 404) {
        console.error(`${chalk.red("✗")} Trigger or function not found.`);
      } else {
        console.error(
          `${chalk.red("✗")} Failed to fetch trigger details.`,
        );
        console.error(`Status Code: ${chalk.red(error.response.status)}`);
        console.error(
          `Message: ${chalk.yellow(error.response.data.message || "Unknown error from server")}`,
        );
      }
    } else if (error.request) {
      console.error(`${chalk.red("✗")} No response received from server.`);
    } else {
      console.error(`${chalk.red("✗")} Error:`, error.message);
    }
  }
}
