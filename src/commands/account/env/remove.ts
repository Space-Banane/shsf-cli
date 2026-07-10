import chalk from "chalk";
import { getApiClient } from "../../../api.js";
import { normalizeEnvList } from "../../../utils/env_vars.js";

export const accountEnvRemoveDefinition = {
  name: "remove",
  description: "Remove an account-wide environment variable.",
  options: [
    { name: "--name <name>", description: "Environment variable name", required: true },
  ],
  action: async (options: any) => {
    const client = await getApiClient();

    try {
      const current = await client.get("/api/account/settings");
      const env = normalizeEnvList(current.data?.data?.accountEnvironment);
      const next = env.filter((item) => item.name !== options.name);

      if (next.length === env.length) {
        console.log(`${chalk.yellow("!")} Account environment variable ${chalk.cyan(options.name)} was not found.`);
        return;
      }

      await client.patch("/api/account/settings", {
        accountEnvironment: next,
      });

      console.log(`${chalk.green("✓")} Account environment variable ${chalk.cyan(options.name)} removed.`);
    } catch (error: any) {
      console.error(`${chalk.red("✗")} ${error.response?.data?.message || error.message}`);
    }
  },
};
