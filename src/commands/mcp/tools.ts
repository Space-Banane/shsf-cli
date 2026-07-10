import chalk from "chalk";
import { callMcp } from "../../utils/mcp.js";
import { printJson } from "../../utils/json.js";

export const mcpToolsDefinition = {
  name: "tools",
  description: "List MCP tools exposed by the SHSF instance.",
  action: async () => {
    try {
      const result = await callMcp("tools/list");
      printJson(result);
    } catch (error: any) {
      console.error(`${chalk.red("✗")} ${error.message}`);
    }
  },
};
