import chalk from "chalk";
import { callMcp } from "../../utils/mcp.js";
import { printJson } from "../../utils/json.js";

export const mcpInitDefinition = {
  name: "init",
  description: "Initialize an MCP session and print server instructions.",
  action: async () => {
    try {
      const result = await callMcp("initialize", {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "shsf-cli", version: "1.0.0" },
      });
      printJson(result);
    } catch (error: any) {
      console.error(`${chalk.red("✗")} ${error.message}`);
    }
  },
};
