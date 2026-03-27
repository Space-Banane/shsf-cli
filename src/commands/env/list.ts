import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const listEnvDefinition = {
  name: "list",
  description: "Lists all environment variables for a serverless function.",
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
      const response = await client.get(`/api/function/${options.id}`);
      
      const functionData = response.data.data || response.data;
      let env = functionData.env;

      if (typeof env === 'string' && env.length > 0) {
        try {
          env = JSON.parse(env);
        } catch (e: any) {
          console.error(`${chalk.red("✗")} Error parsing env string: ${e.message}`);
          env = [];
        }
      }

      const envList: { name: string; value: string }[] = Array.isArray(env) ? env : [];

      if (envList.length === 0) {
        console.log(`${chalk.yellow("!")} No environment variables found for function ${chalk.cyan(options.id)}.`);
        return;
      }

      console.log(`${chalk.blue("ℹ")} Environment variables for function ${chalk.cyan(options.id)}:`);
      envList.forEach((item) => {
        console.log(`${chalk.green("•")} ${chalk.cyan(item.name)}=${chalk.white(item.value)}`);
      });
      console.log(`${chalk.blue("ℹ")} Total: ${envList.length}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.error(`${chalk.red("✗")} Function with ID ${chalk.yellow(options.id)} not found.`);
      } else {
        console.error(`${chalk.red("✗")} Error fetching environment variables: ${chalk.yellow(error.response?.data?.message || error.message)}`);
      }
    }
  },
};
