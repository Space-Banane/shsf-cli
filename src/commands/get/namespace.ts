import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const getNamespaceDefinition = {
  name: "namespace <id>",
  description: "Get detailed information about a namespace by its ID.",
  action: async (id: string) => {
    await getNamespace(id);
  },
};

async function getNamespace(id: string) {
  const client = await getApiClient();

  try {
    const response = await client.get(`/api/namespace/${id}`);

    if (response.status === 200 && response.data.data) {
      const ns = response.data.data;
      
      console.log(chalk.blue.bold(`\nNamespace Details: ${ns.name} (${ns.id})`));
      console.log(`${chalk.gray("-------------------------------------------")}`);
      console.log(`${chalk.yellow("Name:")} ${ns.name}`);
      console.log(`${chalk.yellow("ID:")}   ${ns.id}`);
      
      if (ns.functions && ns.functions.length > 0) {
        console.log(`${chalk.yellow("Functions:")}`);
        ns.functions.forEach((f: any) => {
          console.log(`- ${chalk.cyan(f.name)} ${chalk.gray(`(${f.id})`)}`);
        });
      } else {
        console.log(`${chalk.yellow("Functions:")} ${chalk.gray("None")}`);
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
        console.error(`${chalk.red("✗")} Namespace with ID ${chalk.yellow(id)} not found.`);
      } else {
        console.error(
          `${chalk.red("✗")} Failed to fetch namespace details.`,
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
