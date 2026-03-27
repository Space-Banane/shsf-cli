import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const removeFunctionDefinition = {
  name: "remove",
  description: "Removes a specific environment variable from a serverless function.",
  options: [
    { name: "--id <id>", description: "Function ID", required: true },
    {
      name: "--name <name>",
      description: "Environment variable name to remove",
      required: true,
    },
  ],
  action: async (options: any) => {
    if (!options.id || !options.name) {
      console.error(`${chalk.red("✗")} Error: --id and --name are required`);
      return;
    }

    const client = await getApiClient();

    try {
      const response = await client.get(`/api/function/${options.id}`);
      const functionData = response.data.data || response.data;
      let existingEnv: { name: string; value: string }[] = functionData.env || [];

      if (typeof existingEnv === 'string') {
        try {
          existingEnv = JSON.parse(existingEnv);
        } catch (e: any) {
          existingEnv = [];
        }
      }

      if (!Array.isArray(existingEnv)) {
        existingEnv = [];
      }

      const initialCount = existingEnv.length;
      const filteredEnv = existingEnv.filter((env) => env.name !== options.name);

      if (filteredEnv.length === initialCount) {
        console.warn(`${chalk.yellow("!")} Variable ${chalk.cyan(options.name)} not found. No changes made.`);
        return;
      }

      const patchResponse = await client.patch(`/api/function/${options.id}`, {
        environment: filteredEnv,
      });

      if (patchResponse.status === 200) {
        console.log(
          `${chalk.green("✓")} Variable ${chalk.cyan(options.name)} removed successfully from function ${chalk.cyan(options.id)}.`
        );
        console.log(`${chalk.blue("ℹ")} Remaining environment variables: ${filteredEnv.length}`);
      }
    } catch (error: any) {
      console.error(`${chalk.red("✗")} Error: ${error.response?.data?.message || error.message}`);
    }
  },
};