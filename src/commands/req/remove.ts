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
    { name: "--from <id>", description: "The ID of the function (deprecated alias for --id)." },
    { name: "--id <id>", description: "The ID of the function.", required: true },
  ],
  action: async (pkgToRemove: string, options: { from?: string; id?: string }) => {
    const functionId = options.id ?? options.from;
    if (!functionId) {
      console.error(`${chalk.red("✗")} Error: Function ID is required. Use ${chalk.cyan("--id <id>")}.`);
      return;
    }
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
      
      const targetPkgName = pkgToRemove.trim().toLowerCase();
      let removed = false;
      
      const newLines = lines.filter(line => {
        const trimmedLine = line.trim();
        // Preserve empty/whitespace-only lines
        if (!trimmedLine) return true;
        
        // Strip inline comments and environment markers for matching purposes
        const withoutComment = trimmedLine.split("#", 1)[0];
        const basePart = withoutComment.split(";", 1)[0].trim();

        // If there's no actual requirement (e.g., comment-only line), keep the line
        if (!basePart) return true;

        // Robust extraction (handles != <= >= ~= == and < >)
        const currentPkgName = basePart.split(/[!=>~<]/)[0].trim().toLowerCase();
        
        if (currentPkgName === targetPkgName) {
          removed = true;
          return false;
        }

        return true;
      });

      if (!removed) {
        console.log(`${chalk.yellow("!")} Package ${chalk.cyan(pkgToRemove)} was not found in requirements.txt.`);
        return;
      }

      const newContent = newLines.join("\n");

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
  } else if (error.request) {
    console.error(
      `${chalk.red("✗")} Failed to ${task}: ${chalk.yellow(
        "No response received from server. Please check your network connection and try again."
      )}`
    );
  } else {
    console.error(`${chalk.red("✗")} Error: ${error.message}`);
  }
}
