import chalk from "chalk";
import { getApiClient } from "../../api.js";
import { renameFile, handleAxiosError } from "../../utils/fileops.js";

export const fileRenameDefinition = {
  name: "rename",
  description: "Rename a file in a function.",
  options: [
    { name: "--function-id <id>", description: "Function ID", required: true },
    { name: "--file-id <id>", description: "File ID", required: true },
    { name: "--new-filename <name>", description: "New filename", required: true },
  ],
  action: async (options: any) => {
    const client = await getApiClient();
    try {
      await renameFile(client, options.functionId, options.fileId, options.newFilename);
      console.log(
        `${chalk.green("✓")} File ${chalk.cyan(options.fileId)} renamed to ${chalk.cyan(options.newFilename)} successfully.`,
      );
    } catch (error: any) {
      handleAxiosError(error);
    }
  },
};
