import chalk from "chalk";
import { callMcp } from "../../utils/mcp.js";
import { printJson } from "../../utils/json.js";

export const mcpDocsDefinition = {
  name: "docs",
  description: "Print the SHSF function authoring reference from the MCP get_docs tool.",
  action: async () => {
    try {
      const result: any = await callMcp("tools/call", {
        name: "get_docs",
        arguments: {},
      });
      const text = result?.content?.find?.((item: any) => item.type === "text")?.text;
      if (text) {
        process.stdout.write(`${text}\n`);
      } else {
        printJson(result);
      }
    } catch (error: any) {
      console.error(`${chalk.red("✗")} ${error.message}`);
    }
  },
};
