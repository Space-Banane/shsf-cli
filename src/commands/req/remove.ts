import chalk from "chalk";
import { getApiClient } from "../../api.js";

interface ShsfFile {
  name: string;
  content: string;
}

export const reqRemoveDefinition = {
  name: "remove <package>",
  description: "Remove a package from the requirements.txt of a function.",
  options: [
    { name: "--from <id>", description: "The ID of the function.", required: true },
  ],
  action: async (pkgToRemove: string, options: { from: string }) => {
    const functionId = options.from;
    const client = await getApiClient();

    try {
      // 1. Get current files of the function
      const response = await client.get(`/api/function/${functionId}/files`);
      let files: ShsfFile[] = response.data.data;

      if (!Array.isArray(files)) files = [];

      const requirementsFile = files.find(f => f.name === "requirements.txt");
      if (!requirementsFile) {
        console.log(`${chalk.yellow("!")} No requirements.txt found for function ${chalk.yellow(functionId)}.`);
        return;
      }

      const content = requirementsFile.content;
      const lines = content.split("\n");
      
      const pkgName = pkgToRemove.trim().toLowerCase();
      
      const newLines = lines.filter(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return false; // remove empty lines
        
        // Extract package name from the line (everything before version specifiers)
        const currentPkgName = trimmedLine.split(/[=>~<]/)[0].trim().toLowerCase();
        
        // Match only exactly the package name
        return currentPkgName !== pkgName;
      });

      if (lines.length === newLines.length) {
        console.log(`${chalk.yellow("!")} Package ${chalk.cyan(pkgToRemove)} was not found in requirements.txt.`);
        return;
      }

      const newContent = newLines.join("\n") + (newLines.length > 0 ? "\n" : "");

      // 2. Get function details to find storageId
      const funcResponse = await client.get(`/api/function/${functionId}`);
      const func = funcResponse.data.data;
      if (!func || !func.namespace || !func.namespace.storageId) {
        throw new Error("Could not determine storage ID for function.");
      }
      const storageId = func.namespace.storageId;

      // 3. Overwrite requirements.txt
      await client.put(`/api/storage/${storageId}/files`, {
        path: "requirements.txt",
        content: newContent
      });

      console.log(`${chalk.green("✓")} Removed ${chalk.cyan(pkgToRemove)} from requirements.txt for function ${chalk.yellow(functionId)}.`);
    } catch (error: any) {
      handleError(error, "remove package");
    }
  },
};

function handleError(error: any, task: string) {
  if (error.response) {
    console.error(`${chalk.red("✗")} Failed to ${task}: ${chalk.yellow(error.response.data?.message || error.message)}`);
  } else {
    console.error(`${chalk.red("✗")} Error: ${error.message}`);
  }
}
