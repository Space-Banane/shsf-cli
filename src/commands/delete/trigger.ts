import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const deleteTriggerDefinition = {
  name: "trigger <functionId> <triggerId>",
  description: "Deletes a specific trigger from a function.",
  action: async (functionId: string, triggerId: string) => {
    await deleteTrigger(functionId, triggerId);
  },
};

async function deleteTrigger(functionId: string, triggerId: string) {
  const client = await getApiClient();

  try {
    const response = await client.delete(`/api/functions/${functionId}/triggers/${triggerId}`);

    if (response.status === 200) {
      console.log(
        `${chalk.green("✓")} Trigger with ID ${chalk.cyan(triggerId)} from function ${chalk.cyan(functionId)} has been deleted.`,
      );
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
          `${chalk.red("✗")} Failed to delete trigger.`,
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
