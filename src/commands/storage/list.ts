import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const listStoragesDefinition = {
  name: "list",
  description: "List all storages.",
  action: async () => {
    const client = await getApiClient();

    try {
      const response = await client.get("/api/storage");

      if (response.status === 200 && response.data.data) {
        const storages = response.data.data;
        if (storages.length === 0) {
          console.log(`${chalk.yellow("!")} No storages found.`);
          return;
        }

        console.log(chalk.blue("Storages:"));
        storages.forEach((s: any) => {
          const purposeInfo = s.purpose ? chalk.gray(` - ${s.purpose}`) : "";
          console.log(`- ${chalk.cyan(s.name)}${purposeInfo}`);
        });
      } else {
        console.log(
          `${chalk.yellow("!")} Unexpected response from server: ${response.status}`,
        );
      }
    } catch (error: any) {
      if (error.response) {
        console.error(
          `${chalk.red("✗")} Failed to list storages: ${chalk.yellow(error.response.data.message || "Unknown error")}`,
        );
      } else {
        console.error(`${chalk.red("✗")} Error: ${error.message}`);
      }
    }
  },
};
