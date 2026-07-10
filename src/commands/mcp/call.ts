import chalk from "chalk";
import { callMcp } from "../../utils/mcp.js";
import { printJson, readJsonInput } from "../../utils/json.js";

export const mcpCallDefinition = {
  name: "call <tool>",
  description: "Call an SHSF MCP tool with JSON arguments.",
  options: [
    { name: "--args <json>", description: "Tool arguments as JSON" },
    { name: "--args-file <path>", description: "Read tool arguments from a JSON file" },
  ],
  action: async (tool: string, options: any) => {
    try {
      const args = readJsonInput({
        data: options.args,
        dataFile: options.argsFile,
        defaultValue: {},
      });
      const result = await callMcp("tools/call", {
        name: tool,
        arguments: args,
      });
      printJson(result);
    } catch (error: any) {
      console.error(`${chalk.red("✗")} ${error.message}`);
    }
  },
};
