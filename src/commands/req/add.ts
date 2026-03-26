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
    { name: "--to <id>", description: "The ID of the function.", required: true },
  ],
  action: async (pkg: string, options: { to: string }) => {
    const functionId = options.to;
    const client = await getApiClient();

    try {
      // 1. Get current files of the function
      const response = await client.get(`/api/function/${functionId}/files`);
      let files: ShsfFile[] = response.data.data;

      if (!Array.isArray(files)) files = [];

      let requirementsFile = files.find(f => f.name === "requirements.txt");
      let content = requirementsFile ? requirementsFile.content : "";

      // 2. Add the package
      const lines = content.split("\n").map(l => l.trim()).filter(l => l.length > 0);
      
      // Check if it already exists (simple check for exact match or name match)
      const pkgName = pkg.split(/[=>~]/)[0].trim().toLowerCase();
      const exists = lines.some(line => {
        const lineName = line.split(/[=>~]/)[0].trim().toLowerCase();
        return lineName === pkgName;
      });

      if (exists) {
        console.log(`${chalk.yellow("!")} Package ${chalk.cyan(pkgName)} is already in requirements.txt.`);
        return;
      }

      lines.push(pkg);
      const newContent = lines.join("\n") + "\n";

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
        content: newContent
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
  } else {
    console.error(`${chalk.red("✗")} Error: ${error.message}`);
  }
}
