import chalk from "chalk";
import { getApiClient } from "../../../api.js";
import { normalizeEnvList } from "../../../utils/env_vars.js";

export const accountEnvAddDefinition = {
  name: "add",
  description: "Add or update an account-wide environment variable.",
  options: [
    { name: "--name <name>", description: "Environment variable name", required: true },
    { name: "--value <value>", description: "Environment variable value", required: true },
  ],
  action: async (options: any) => {
    const client = await getApiClient();

    try {
      const current = await client.get("/api/account/settings");
      const env = normalizeEnvList(current.data?.data?.accountEnvironment);
      const existingIndex = env.findIndex((item) => item.name === options.name);
      const updated = existingIndex >= 0;

      if (updated) {
        env[existingIndex].value = options.value;
      } else {
        env.push({ name: options.name, value: options.value });
      }

      await client.patch("/api/account/settings", {
        accountEnvironment: env,
      });

      console.log(
        `${chalk.green("✓")} Account environment variable ${chalk.cyan(options.name)} ${updated ? "updated" : "added"}.`,
      );
    } catch (error: any) {
      console.error(`${chalk.red("✗")} ${error.response?.data?.message || error.message}`);
    }
  },
};
