import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const updateFunctionDefinition = {
  name: "add",
  description:
    "Adds or updates environment variables for a serverless function.",
  options: [
    { name: "--id <id>", description: "Function ID", required: true },
    {
      name: "--name <name>",
      description: "Environment variable name",
      required: true,
    },
    {
      name: "--value <value>",
      description: "Environment variable value",
      required: true,
    },
  ],
  action: async (options: any) => {
    if (!options.id || !options.name || !options.value) {
      console.error(
        `${chalk.red("✗")} Error: Missing required options (--id, --name, --value)`,
      );
      return;
    }

    const client = await getApiClient();
    let existingEnv: { name: string; value: string }[] = [];

    try {
      const response = await client.get(`/api/function/${options.id}`);
      const functionData = response.data.data || response.data;
      existingEnv = functionData.env || [];
      
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
    } catch (error: any) {
      console.error(
        `${chalk.red("✗")} Error fetching function data: ${error.message}`,
      );
      return;
    }

    const newEnv = [...existingEnv];
    const existingIndex = newEnv.findIndex((env) => env.name === options.name);
    const isUpdate = existingIndex !== -1;

    if (isUpdate) {
      newEnv[existingIndex].value = options.value;
    } else {
      newEnv.push({ name: options.name, value: options.value });
    }

    const totalCount = newEnv.length;

    try {
      const response = await client.patch(`/api/function/${options.id}`, {
        environment: newEnv,
      });

      if (response.status === 200) {
        const actionText = isUpdate ? "updated" : "added";
        console.log(
          `${chalk.green("✓")} Environment variable ${chalk.cyan(options.name)} ${actionText} successfully for function ${chalk.cyan(options.id)}.`,
        );
        console.log(
          `${chalk.blue("ℹ")} Total environment variables: ${totalCount}`,
        );
      } else {
        console.error(
          `${chalk.red("✗")} Unexpected response from server: ${response.status}`,
        );
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.error(
          `${chalk.red("✗")} Function with ID ${chalk.yellow(options.id)} not found.`,
        );
      } else {
        console.error(
          `${chalk.red("✗")} Failed to update: ${chalk.yellow(error.response?.data?.message || error.message)}`,
        );
      }
    }
  },
};
