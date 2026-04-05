import chalk from "chalk";
import { getApiClient } from "../../api.js";
import { deleteFile, handleAxiosError } from "../../utils/fileops.js";

export const fileDeleteDefinition = {
  name: "delete",
  description: "Delete a file from a function.",
  options: [
    { name: "--function-id <id>", description: "Function ID", required: true },
    { name: "--file-id <id>", description: "File ID (from 'file list')", required: true },
  ],
  action: async (options: any) => {
    const client = await getApiClient();
    try {
      await deleteFile(client, options.functionId, options.fileId, undefined);
      console.log(
        `${chalk.green("✓")} File ${chalk.cyan(options.fileId)} deleted from function ${chalk.cyan(options.functionId)}.`,
      );
    } catch (error: any) {
      handleAxiosError(error);
    }
  },
};
