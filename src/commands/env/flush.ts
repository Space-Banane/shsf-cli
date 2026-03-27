import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const flushFunctionDefinition = {
  name: "flush",
  description: "Removes ALL environment variables from a serverless function.",
  options: [
    { name: "--id <id>", description: "Function ID", required: true },
  ],
  action: async (options: any) => {
    if (!options.id) {
      console.error(`${chalk.red("✗")} Error: --id is required`);
      return;
    }

    const client = await getApiClient();

    try {
      const response = await client.patch(`/api/function/${options.id}`, {
        environment: [],
      });

      if (response.status === 200) {
        console.log(
          `${chalk.green("✓")} All environment variables flushed for function ${chalk.cyan(options.id)}.`
        );
        console.log(`${chalk.blue("ℹ")} Total environment variables: 0`);
      }
    } catch (error: any) {
      console.error(`${chalk.red("✗")} Error: ${error.response?.data?.message || error.message}`);
    }
  },
};