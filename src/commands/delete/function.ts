import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const deleteFunctionDefinition = {
  name: "function <id>",
  description: "Deletes a specific serverless function by its ID.",
  action: async (id: string) => {
    await deleteFunction(id);
  },
};

async function deleteFunction(id: string) {
  const client = await getApiClient();

  try {
    const response = await client.delete(`/api/function/${id}`);

    if (response.status === 200) {
      console.log(
        `${chalk.green("✓")} Function with ID ${chalk.cyan(id)} has been deleted.`,
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
        console.error(`${chalk.red("✗")} Function with ID ${chalk.yellow(id)} not found.`);
      } else {
        console.error(
          `${chalk.red("✗")} Failed to delete function.`,
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
