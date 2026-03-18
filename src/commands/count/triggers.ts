import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const triggersCountDefinition = {
  name: "triggers",
  description: "Counts the amount of triggers the current user has.",
  action: async () => {
    await countTriggers();
  },
};

async function countTriggers() {
  const client = await getApiClient();

  try {
    const response = await client.get("/api/triggers");

    if (response.status === 200 && response.data.data) {
      const triggers = response.data.data;
      const count = triggers.length;

      if (count > 0) {
        console.log(chalk.blue("Triggers List:"));
        triggers.forEach((t: any) => {
          const functionInfo = t.function ? chalk.gray(` [Func: ${t.function.name}]`) : "";
          const cronInfo = t.cron ? chalk.yellow(` (Cron: ${t.cron})`) : "";
          console.log(`- ${chalk.cyan(t.name)} ${chalk.gray(`(${t.id})`)}${functionInfo}${cronInfo}`);
          if (t.description) {
            console.log(`  ${chalk.italic.gray(t.description)}`);
          }
        });
        console.log("");
      }

      console.log(
        `${chalk.green("✓")} You have ${chalk.bgGreen.black(` ${count} `)} triggers.`,
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
        `${chalk.red("✗")} Failed to fetch trigger count.`,
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
