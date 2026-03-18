import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const namespacesCountDefinition = {
  name: "namespaces",
  description: "Counts the amount of namespaces the current user has.",
  options: [
    { name: "--full", description: "List all namespaces instead of just the count", type: "boolean" },
  ],
  action: async (options: any) => {
    await countNamespaces(options?.full);
  },
};

async function countNamespaces(full: boolean = false) {
  const client = await getApiClient();

  try {
    const response = await client.get("/api/namespaces");

    if (response.status === 200 && response.data.data) {
      const namespaces = response.data.data;
      const count = namespaces.length;

      if (full && count > 0) {
        console.log(chalk.blue("Namespaces List:"));
        namespaces.forEach((ns: any) => {
          console.log(`- ${chalk.cyan(ns.name)} ${chalk.gray(`(${ns.id})`)}`);
        });
        console.log("");
      }

      console.log(
        `${chalk.green("✓")} You have ${chalk.bgGreen.black(` ${count} `)} namespaces.`,
      );
    } else {
      console.log(
        `${chalk.yellow("!")} Unexpected response from server.`,
      );
      console.log(`Status Code: ${chalk.blue(response.status)}`);
    }
  } catch (error: any) {
    if (error.response) {
      console.error(
        `${chalk.red("✗")} Failed to fetch namespace count.`,
      );
      console.error(`Status Code: ${chalk.red(error.response.status)}`);
      console.error(
        `Message: ${chalk.yellow(error.response.data.message || "Unknown error from server")}`,
      );
    } else if (error.request) {
      console.error(`${chalk.red("✗")} No response received from server.`);
    } else {
      console.error(`${chalk.red("✗")} Error:`, error.message);
    }
  }
}
