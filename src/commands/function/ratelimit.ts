import chalk from "chalk";
import { getApiClient } from "../../api.js";
import { printJson, readJsonInput } from "../../utils/json.js";

export const functionRateLimitDefinition = {
  name: "ratelimit",
  description: "Get or update execution rate-limit configuration for a function.",
  options: [
    { name: "--id <id>", description: "Function ID", required: true },
    { name: "--config <json>", description: "Rate-limit config JSON to PATCH" },
    { name: "--config-file <path>", description: "Read rate-limit config JSON from a file" },
  ],
  action: async (options: any) => {
    const client = await getApiClient();

    try {
      if (options.config !== undefined || options.configFile !== undefined) {
        const config = readJsonInput({
          data: options.config,
          dataFile: options.configFile,
        });
        const response = await client.patch(`/api/function/${options.id}/ratelimit`, config);
        printJson(response.data);
        return;
      }

      const response = await client.get(`/api/function/${options.id}/ratelimit`);
      printJson(response.data);
    } catch (error: any) {
      console.error(`${chalk.red("✗")} ${error.response?.data?.message || error.message}`);
    }
  },
};
