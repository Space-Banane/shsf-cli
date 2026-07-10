import chalk from "chalk";
import { getApiClient } from "../../../api.js";
import { normalizeEnvList } from "../../../utils/env_vars.js";

export const accountEnvListDefinition = {
  name: "list",
  description: "List account-wide environment variables.",
  action: async () => {
    const client = await getApiClient();

    try {
      const response = await client.get("/api/account/settings");
      const env = normalizeEnvList(response.data?.data?.accountEnvironment);

      if (env.length === 0) {
        console.log(`${chalk.yellow("!")} No account-wide environment variables found.`);
        return;
      }

      env.forEach((item) => {
        console.log(`${chalk.green("•")} ${chalk.cyan(item.name)}=${chalk.white(item.value)}`);
      });
      console.log(`${chalk.blue("Total:")} ${env.length}`);
    } catch (error: any) {
      console.error(`${chalk.red("✗")} ${error.response?.data?.message || error.message}`);
    }
  },
};
