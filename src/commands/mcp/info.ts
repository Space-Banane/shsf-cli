import chalk from "chalk";
import { getApiClient } from "../../api.js";
import { printJson } from "../../utils/json.js";

export const mcpInfoDefinition = {
  name: "info",
  description: "Print SHSF MCP server metadata.",
  action: async () => {
    const client = await getApiClient();

    try {
      const response = await client.get("/mcp");
      printJson(response.data);
    } catch (error: any) {
      console.error(`${chalk.red("✗")} ${error.response?.data?.message || error.message}`);
    }
  },
};
