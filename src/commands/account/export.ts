import chalk from "chalk";
import fs from "fs";
import { getApiClient } from "../../api.js";
import { printJson } from "../../utils/json.js";

export const accountExportDefinition = {
  name: "export",
  description: "Export the authenticated SHSF account data.",
  options: [
    { name: "--out <path>", description: "Write export JSON to a file instead of stdout" },
  ],
  action: async (options: any) => {
    const client = await getApiClient();

    try {
      const response = await client.get("/api/account/export");
      if (options.out) {
        fs.writeFileSync(options.out, JSON.stringify(response.data, null, 2));
        console.log(`${chalk.green("✓")} Account export written to ${chalk.cyan(options.out)}.`);
      } else {
        printJson(response.data);
      }
    } catch (error: any) {
      console.error(`${chalk.red("✗")} ${error.response?.data?.message || error.message}`);
    }
  },
};
