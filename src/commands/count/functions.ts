import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const functionsCountDefinition = {
  name: "functions",
  description: "Counts the amount of functions the current user has.",
  options: [
    { name: "--full", description: "List all functions instead of just the count", type: "boolean" },
  ],
  action: async (options: any) => {
    await countFunctions(options?.full);
  },
};

async function countFunctions(full: boolean = false) {
  const client = await getApiClient();

  try {
    const response = await client.get("/api/functions");

    if (response.status === 200 && response.data.data) {
      const functions = response.data.data;
      const count = functions.length;

      if (full && count > 0) {
        console.log(chalk.blue("Functions List:"));
        functions.forEach((f: any) => {
          const namespaceInfo = f.namespace ? chalk.gray(` [NS: ${f.namespace.id}]`) : "";
          console.log(`- ${chalk.cyan(f.name)} ${chalk.gray(`(${f.id})`)}${namespaceInfo}`);
          if (f.description) {
            console.log(`  ${chalk.italic.gray(f.description)}`);
          }
        });
        console.log("");
      }

      console.log(
        `${chalk.green("✓")} You have ${chalk.bgGreen.black(` ${count} `)} functions.`,
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
        `${chalk.red("✗")} Failed to fetch function count.`,
      );
      console.error(`Status Code: ${chalk.red(error.response.status)}`);
      console.error(
        `Message: ${chalk.yellow(error.response.data.message || "Unknown error from server")}`,
      );
    } else {
      console.error(
        `${chalk.red("✗")} Local error occurred.`,
      );
      console.error(`Error: ${chalk.yellow(error.message)}`);
    }
  }
}
