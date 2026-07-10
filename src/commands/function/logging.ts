import chalk from "chalk";
import { getApiClient } from "../../api.js";
import { printJson } from "../../utils/json.js";

function parseBoolean(value: unknown, optionName: string): boolean | undefined {
  if (value === undefined) return undefined;
  const normalized = String(value).toLowerCase();
  if (normalized !== "true" && normalized !== "false") {
    throw new Error(`Invalid value for ${optionName}. Use true or false.`);
  }
  return normalized === "true";
}

export const functionLoggingDefinition = {
  name: "logging",
  description: "Get or update logging configuration for a function.",
  options: [
    { name: "--id <id>", description: "Function ID", required: true },
    { name: "--enabled <enabled>", description: "Enable logging (true/false)" },
    { name: "--hide-payload-headers <enabled>", description: "Hide request headers in logs (true/false)" },
  ],
  action: async (options: any) => {
    const client = await getApiClient();

    try {
      const enabled = parseBoolean(options.enabled, "--enabled");
      const hidePayloadHeaders = parseBoolean(
        options.hidePayloadHeaders,
        "--hide-payload-headers",
      );

      if (enabled === undefined && hidePayloadHeaders === undefined) {
        const response = await client.get(`/api/function/${options.id}/logging`);
        printJson(response.data);
        return;
      }

      const response = await client.patch(`/api/function/${options.id}/logging`, {
        ...(enabled !== undefined ? { enabled } : {}),
        ...(hidePayloadHeaders !== undefined
          ? { hide_payload_headers: hidePayloadHeaders }
          : {}),
      });
      printJson(response.data);
    } catch (error: any) {
      console.error(`${chalk.red("✗")} ${error.response?.data?.message || error.message}`);
    }
  },
};
