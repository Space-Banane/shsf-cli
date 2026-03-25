import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const reqAddDefinition = {
  name: "add",
  description: "Add a package to the function's requirements.txt",
  options: [
    { name: "--id <id>", description: "Function ID", required: true },
  ],
  action: async (options: { id: string }, packageName: string) => {
    await modifyRequirements(options.id, packageName, "add");
  },
};

function stripVersion(packageName: string): string {
  return packageName.replace(/[=<>~!]+.*$/, '').trim();
}

function parseRequirements(content: string): string[] {
  if (!content.trim()) return [];
  return content.split('\n').map(line => line.trim()).filter(line => line.length > 0 && !line.startsWith('#'));
}

function buildRequirements(packages: string[]): string {
  return packages.sort().join('\n') + '\n';
}

async function modifyRequirements(functionId: string, packageName: string, action: "add" | "remove") {
  const client = await getApiClient();
  const cleanPackage = stripVersion(packageName);

  try {
    const response = await client.get(`/api/function/${functionId}/files`);
    const files: { name: string; content?: string }[] = response.data.data;

    if (!files || files.length === 0) {
      console.error(chalk.red(`✗ No files found for function ${functionId}`));
      return;
    }

    const reqFile = files.find(f => f.name === "requirements.txt");

    if (action === "remove") {
      if (!reqFile) {
        console.error(chalk.yellow(`! No requirements.txt found for function ${functionId}`));
        return;
      }

      const packages = parseRequirements(reqFile.content || "");
      const strippedPackage = stripVersion(packageName);
      const filteredPackages = packages.filter(pkg => stripVersion(pkg) !== strippedPackage);

      if (packages.length === filteredPackages.length) {
        console.log(chalk.yellow(`! Package ${chalk.cyan(strippedPackage)} not found in requirements.txt`));
        return;
      }

      const newContent = buildRequirements(filteredPackages);

      await client.put(`/api/function/${functionId}/file`, {
        filename: "requirements.txt",
        code: newContent,
      });

      console.log(chalk.green(`✓ Removed ${chalk.cyan(strippedPackage)} from requirements.txt`));
    } else {
      let currentPackages: string[] = [];
      let newContent: string;

      if (reqFile) {
        currentPackages = parseRequirements(reqFile.content || "");

        if (currentPackages.some(pkg => stripVersion(pkg) === cleanPackage)) {
          console.log(chalk.yellow(`! Package ${chalk.cyan(cleanPackage)} already exists in requirements.txt`));
          return;
        }

        currentPackages.push(packageName);
        newContent = buildRequirements(currentPackages);
      } else {
        newContent = cleanPackage + '\n';
      }

      await client.put(`/api/function/${functionId}/file`, {
        filename: "requirements.txt",
        code: newContent,
      });

      console.log(chalk.green(`✓ Added ${chalk.cyan(cleanPackage)} to requirements.txt`));
    }
  } catch (error: any) {
    if (error.response) {
      console.error(chalk.red(`✗ Failed to modify requirements.txt`));
      console.error(`Status Code: ${chalk.red(error.response.status)}`);
      console.error(`Message: ${chalk.yellow(error.response.data?.message || "Unknown error")}`);
    } else if (error.request) {
      console.error(chalk.red(`✗ Could not connect to SHSF instance`));
    } else {
      console.error(chalk.red(`✗ Error: ${error.message}`));
    }
  }
}
