import chalk from "chalk";
import fs from "fs/promises";
import { getApiClient } from "../../api.js";

export const fileOverwriteDefinition = {
  name: "overwrite",
  description: "Overwrite an existing file in a storage.",
  options: [
    { name: "--storage-id <id>", description: "Storage ID", required: true },
    { name: "--path <path>", description: "Remote file path", required: true },
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
      path: options.path,
      content,
    };

    try {
      const response = await client.put(`/api/storage/${options.storageId}/files`, payload);

      if (response.status === 200) {
        console.log(
          `${chalk.green("✓")} File ${chalk.cyan(options.path)} overwritten successfully in storage ${chalk.cyan(options.storageId)}.`,
        );
      } else {
        console.log(`${chalk.yellow("!")} Unexpected response from server: ${response.status}`);
      }
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 404) {
          console.error(`${chalk.red("✗")} File ${chalk.yellow(options.path)} not found.`);
        } else {
          console.error(
            `${chalk.red("✗")} Failed to overwrite file: ${chalk.yellow(error.response.data?.message || "Unknown error")}`,
          );
        }
      } else if (error.request) {
        console.error(`${chalk.red("✗")} No response received from server.`);
      } else {
        console.error(`${chalk.red("✗")} Error: ${error.message}`);
      }
    }
  },
};
