import chalk from "chalk";
import fs from "fs/promises";
import { getApiClient } from "../../api.js";

export const fileCreateDefinition = {
  name: "create",
  description: "Create or update a file in a function.",
  options: [
    { name: "--function-id <id>", description: "Function ID", required: true },
    { name: "--filename <name>", description: "Remote filename", required: true },
    { name: "--content <content>", description: "Inline file content" },
    { name: "--source <source>", description: "Local source file path" },
  ],
  action: async (options: any) => {
    if (!options.content && !options.source) {
      console.error(`${chalk.red("✗")} You must provide either --content or --source.`);
      return;
    }

    if (options.content && options.source) {
      console.error(`${chalk.red("✗")} Please provide only one of --content or --source.`);
      return;
    }

    let content = options.content;
    if (options.source) {
      try {
        content = await fs.readFile(options.source, "utf8");
      } catch (error: any) {
        console.error(`${chalk.red("✗")} Failed to read source file: ${chalk.yellow(error.message)}`);
        return;
      }
    }

    const client = await getApiClient();
    const payload = {
      filename: options.filename,
      code: content,
    };

    try {
      const response = await client.put(`/api/function/${options.functionId}/file`, payload);

      if (response.status === 200 || response.status === 201) {
        console.log(
          `${chalk.green("✓")} File ${chalk.cyan(options.filename)} created/updated successfully in function ${chalk.cyan(options.functionId)}.`,
        );
      } else {
        console.log(`${chalk.yellow("!")} Unexpected response from server: ${response.status}`);
      }
    } catch (error: any) {
      if (error.response) {
        console.error(
          `${chalk.red("✗")} Failed to create/update file: ${chalk.yellow(error.response.data?.message || "Unknown error")}`,
        );
      } else if (error.request) {
        console.error(`${chalk.red("✗")} No response received from server.`);
      } else {
        console.error(`${chalk.red("✗")} Error: ${error.message}`);
      }
    }
  },
};
