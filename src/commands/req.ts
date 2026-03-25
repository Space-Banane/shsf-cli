import chalk from "chalk";
import { getApiClient } from "../api.js";
import fs from "fs";
import path from "path";
import { program } from "../index.js";

// Helper to strip version specifiers (==, >=, <=, <, >, ~=, !=, etc.)
function stripVersion(packageName: string): string {
  return packageName.replace(/[=<>~!]+.*$/, '').trim();
}

// Helper to parse requirements.txt content into lines
function parseRequirements(content: string): string[] {
  if (!content.trim()) return [];
  return content.split('\n').map(line => line.trim()).filter(line => line.length > 0 && !line.startsWith('#'));
}

// Helper to build requirements.txt content
function buildRequirements(packages: string[]): string {
  return packages.sort().join('\n') + '\n';
}

// Main modification function
async function modifyRequirements(functionId: string, packageName: string, action: "add" | "remove") {
  const client = await getApiClient();
  const cleanPackage = stripVersion(packageName);

  try {
    // Get all files from the function
    const response = await client.get(`/api/function/${functionId}/files`);
    const files: { name: string; content?: string }[] = response.data.data;

    if (!files || files.length === 0) {
      console.error(chalk.red(`✗ No files found for function ${functionId}`));
      return;
    }

    // Find requirements.txt
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
      // add
      let currentPackages: string[] = [];
      let newContent: string;

      if (reqFile) {
        currentPackages = parseRequirements(reqFile.content || "");
        
        // Check if package already exists (compare stripped names)
        if (currentPackages.some(pkg => stripVersion(pkg) === cleanPackage)) {
          console.log(chalk.yellow(`! Package ${chalk.cyan(cleanPackage)} already exists in requirements.txt`));
          return;
        }

        currentPackages.push(packageName);
        newContent = buildRequirements(currentPackages);
      } else {
        // Create new requirements.txt
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

// Create the req command with subcommands
const reqCommand = program
  .command("req")
  .description("Manage function requirements.txt");

reqCommand
  .command("add <package>")
  .description("Add a package to the function's requirements.txt")
  .requiredOption("--id <id>", "Function ID")
  .action(async (packageName: string, options: { id: string }) => {
    await modifyRequirements(options.id, packageName, "add");
  });

reqCommand
  .command("remove <package>")
  .description("Remove a package from the function's requirements.txt")
  .requiredOption("--id <id>", "Function ID")
  .action(async (packageName: string, options: { id: string }) => {
    await modifyRequirements(options.id, packageName, "remove");
  });

// Export definition to satisfy the command resolver
// The actual subcommands are registered above via Commander's API
export const reqDefinition = {
  name: "req",
  description: "Manage function requirements.txt (use: shsf req add <pkg> --id <id> OR shsf req remove <pkg> --id <id>)",
  action: async () => {
    // This won't be called since we use subcommands, but satisfies the interface
    program.outputHelp();
  },
};