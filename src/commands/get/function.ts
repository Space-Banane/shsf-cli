import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const getFunctionDefinition = {
  name: "function <id>",
  description: "Get detailed information about a function by its ID.",
  action: async (id: string) => {
    await getFunction(id);
  },
};

async function getFunction(id: string) {
  const client = await getApiClient();

  try {
    const response = await client.get(`/api/function/${id}`);

    if (response.status === 200 && response.data.data) {
      const f = response.data.data;
      
      console.log(chalk.blue.bold(`\nFunction Details: ${f.name} (${f.id})`));
      console.log(`${chalk.gray("-------------------------------------------")}`);
      console.log(`${chalk.yellow("Name:")}        ${f.name}`);
      console.log(`${chalk.yellow("ID:")}          ${f.id}`);
      console.log(`${chalk.yellow("Description:")} ${f.description || chalk.gray("No description")}`);
      console.log(`${chalk.yellow("Image:")}       ${f.image}`);
      console.log(`${chalk.yellow("Startup File:")} ${f.startup_file}`);
      
      if (f.namespace) {
        console.log(`${chalk.yellow("Namespace:")}    ${f.namespace.name} (${f.namespace.id})`);
      }

      if (f.executionAlias) {
        console.log(`${chalk.yellow("Alias:")}        ${f.executionAlias}`);
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
        console.error(`${chalk.red("✗")} Function with ID ${chalk.yellow(id)} not found.`);
      } else {
        console.error(
          `${chalk.red("✗")} Failed to fetch function details.`,
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
