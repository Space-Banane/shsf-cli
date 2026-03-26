import chalk from "chalk";
import { getApiClient } from "../../api.js";

interface ShsfFile {
  name: string;
  content: string;
}

export const reqAddDefinition = {
  name: "add <package>",
  description: "Add a package to the requirements.txt of a function.",
  options: [
    { name: "--to <id>", description: "The ID of the function (deprecated alias for --id)." },
    { name: "--id <id>", description: "The ID of the function.", required: true },
  ],
  action: async (pkg: string, options: { to?: string; id?: string }) => {
    const functionId = options.id ?? options.to;
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

      let requirementsFile = files.find(f => f.name === "requirements.txt");
      let content = requirementsFile ? requirementsFile.content : "";

      // 2. Add the package
      const lines = content.split("\n");
      
      // Robust package name extraction
      const getPkgName = (line: string) => {
        const withoutComment = line.trim().split("#", 1)[0];
        const basePart = withoutComment.split(";", 1)[0].trim();
        if (!basePart) return null;
        return basePart.split(/[!=>~<]/)[0].trim().toLowerCase();
      };

      const pkgToAddName = getPkgName(pkg);
      if (!pkgToAddName) {
        console.error(`${chalk.red("✗")} Invalid package format.`);
        return;
      }

      const exists = lines.some(line => {
        const lineName = getPkgName(line);
        return lineName === pkgToAddName;
      });

      if (exists) {
        console.log(`${chalk.yellow("!")} Package ${chalk.cyan(pkgToAddName)} is already in requirements.txt.`);
        return;
      }

      // Preserve existing content structure
      if (content && !content.endsWith("\n")) {
        content += "\n";
      }
      content += pkg + "\n";

      // 3. Get function details to find storageId
      const funcResponse = await client.get(`/api/function/${functionId}`);
      const func = funcResponse.data.data;
      if (!func || !func.namespace || !func.namespace.storageId) {
        throw new Error("Could not determine storage ID for function.");
      }
      const storageId = func.namespace.storageId;

      // 4. Overwrite/Create requirements.txt
      await client.put(`/api/storage/${storageId}/files`, {
        path: "requirements.txt",
        content: content
      });

      console.log(`${chalk.green("✓")} Added ${chalk.cyan(pkg)} to requirements.txt for function ${chalk.yellow(functionId)}.`);
    } catch (error: any) {
      handleError(error, "add package");
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
