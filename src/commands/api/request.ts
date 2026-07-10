import chalk from "chalk";
import { getApiClient } from "../../api.js";
import { printJson, readJsonInput } from "../../utils/json.js";

function normalizePath(input: string): string {
  return input.startsWith("/") ? input : `/${input}`;
}

function parseHeaders(rawHeaders: string | string[] | undefined): Record<string, string> {
  const headers: Record<string, string> = {};
  const values = Array.isArray(rawHeaders)
    ? rawHeaders
    : rawHeaders
      ? [rawHeaders]
      : [];

  for (const header of values) {
    const separator = header.indexOf(":");
    if (separator === -1) {
      throw new Error(`Invalid header "${header}". Use "Name: value".`);
    }
    const name = header.slice(0, separator).trim();
    const value = header.slice(separator + 1).trim();
    if (!name) throw new Error(`Invalid header "${header}". Header name is empty.`);
    headers[name] = value;
  }

  return headers;
}

export const apiRequestDefinition = {
  name: "request <method> <path>",
  description: "Call any SHSF REST endpoint with the configured access token.",
  options: [
    { name: "--data <json>", description: "JSON request body" },
    { name: "--data-file <path>", description: "Read JSON request body from a file" },
    { name: "--query <json>", description: "JSON query parameters" },
    { name: "--header <header...>", description: "Additional header as 'Name: value'" },
  ],
  action: async (method: string, path: string, options: any) => {
    try {
      const client = await getApiClient();
      const upperMethod = method.toUpperCase();
      const query = options.query ? readJsonInput({ data: options.query }) : undefined;
      const headers = parseHeaders(options.header);
      const hasBody = !["GET", "HEAD"].includes(upperMethod);
      const data = hasBody
        ? readJsonInput({
            data: options.data,
            dataFile: options.dataFile,
            defaultValue: undefined,
          })
        : undefined;

      const response = await client.request({
        method: upperMethod,
        url: normalizePath(path),
        params: query,
        headers,
        data,
      });

      printJson(response.data);
    } catch (error: any) {
      if (error.response) {
        console.error(`${chalk.red("✗")} ${error.response.status} ${error.response.statusText}`);
        printJson(error.response.data);
      } else {
        console.error(`${chalk.red("✗")} ${error.message}`);
      }
    }
  },
};
