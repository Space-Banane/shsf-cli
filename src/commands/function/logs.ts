import chalk from "chalk";
import { getApiClient } from "../../api.js";
import { printJson } from "../../utils/json.js";

export const functionLogsDefinition = {
  name: "logs",
  description: "Fetch or clear execution logs for a function.",
  options: [
    { name: "--id <id>", description: "Function ID", required: true },
    { name: "--clear", description: "Delete all logs for the function", type: "boolean" },
    { name: "--log-id <id>", description: "Delete a specific log ID when used with --clear" },
  ],
  action: async (options: any) => {
    const client = await getApiClient();

    try {
      if (options.clear) {
        const url = options.logId
          ? `/api/function/${options.id}/logs/${options.logId}`
          : `/api/function/${options.id}/logs`;
        const response = await client.delete(url);
        printJson(response.data);
        return;
      }

      const response = await client.get(`/api/function/${options.id}/logs`);
      printJson(response.data);
    } catch (error: any) {
      console.error(`${chalk.red("✗")} ${error.response?.data?.message || error.message}`);
    }
  },
};
