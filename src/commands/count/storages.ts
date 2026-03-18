import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const storagesCountDefinition = {
  name: "storages",
  description: "Counts the amount of storages the current user has.",
  action: async () => {
    await countStorages();
  },
};

async function countStorages() {
  const client = await getApiClient();

  try {
    const response = await client.get("/api/storage");

    if (response.status === 200 && response.data.data) {
      const storages = response.data.data;
      const count = storages.length;

      if (count > 0) {
        console.log(chalk.blue("Storages List:"));
        storages.forEach((s: any) => {
          const purposeInfo = s.purpose ? chalk.gray(` - ${s.purpose}`) : "";
          console.log(`- ${chalk.cyan(s.name)}${purposeInfo}`);
        });
        console.log("");
      }

      console.log(
        `${chalk.green("✓")} You have ${chalk.bgGreen.black(` ${count} `)} storages.`,
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
        `${chalk.red("✗")} Failed to fetch storage count.`,
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
