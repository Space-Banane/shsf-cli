import chalk from "chalk";
import { getApiClient } from "../../api.js";
import fs from "fs";
import path from "path";
import { createHash } from "crypto";

const unpushableFiles = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".bmp",
  ".ico",
  ".zip",
  ".tar",
  ".gz",
  ".7z",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".exe",
  ".dll",
  ".so",
  ".dylib",
  "docker-compose.yml",
  "docker-compose.yaml",
  "compose.yaml",
  "compose.yml",
  "dockerfile",
  "dockerfile.dev",
  "dockerfile.prod",
  ".gitignore",
  ".env",
  ".gitkeep",
  ".md"
];

async function deleteNonexistentFiles(
  currentFiles: any[],
  files: any[],
  client: any,
  options: any,
): Promise<{ didDeletion: boolean }> {
  let didDeletion = false;
  for (const currentFile of currentFiles) {
    if (!files.some((f: any) => f.filename === currentFile.name)) {
      try {
        await client.delete(
          `/api/function/${options.id}/file/${currentFile.id}`,
          {
            data: { filename: currentFile.name },
          },
        );
      } catch (error: any) {
        throw error;
      }
      console.log(
        chalk.green(`Deleted ${currentFile.name} from function ${options.id}`),
      );
      didDeletion = true;
    }
  }
  return { didDeletion };
}

export const pushDefinition = {
  name: "push",
  description: "Push files to a remote function.",
  options: [
    { name: "--id <id>", description: "Function ID", required: true },
    { name: "--from <path>", description: "Source directory", required: true },
    { name: "--force", description: "Force overwrite" },
  ],
  action: async (options: any) => {
    const client = await getApiClient();

    if (!fs.existsSync(options.from)) {
      console.error(chalk.red(`Source ${options.from} does not exist.`));
      return;
    }

    let didDeletion = false; // Track if any deletions were made

    const currentFilesResponse = await client.get(
      `/api/function/${options.id}/files`,
    );
    const currentFiles = currentFilesResponse.data.data; // Expecting { name: string, id: string [...] }[]

    // Read local files and filter to only include files (exclude directories)
    const files = fs
      .readdirSync(options.from)
      .map((file) => {
        const filePath = path.join(options.from, file);
        return { filename: file, filePath };
      })
      .filter(({ filePath }) => fs.statSync(filePath).isFile())
      .map(({ filename, filePath }) => ({
        filename,
        content: fs.readFileSync(filePath, "utf-8"),
      }));

    if (!options.force && files.length > 5) {
      console.log(
        chalk.yellow("Too many modifications. Please use --force to confirm."),
      );
      return;
    }

    // Push new and modified files
    let pushedFilesCount = 0;
    try {
      for (const file of files) {
        // Hash first, save traffic
        const fileHash = createHash("md5").update(file.content).digest("hex");
        const currentFile = currentFiles.find(
          (f: any) => f.name === file.filename,
        );
        if (currentFile) {
          const currentFileHash = createHash("md5")
            .update(currentFile.content || "")
            .digest("hex");
          if (fileHash === currentFileHash) {
            console.log(
              chalk.yellow(
                `Skipping ${file.filename}, no changes detected for function ${options.id}`,
              ),
            );
            continue;
          }
        }

        const filenameLower = file.filename.toLowerCase();
        // Unpushable file check
        if (unpushableFiles.some((suffix) => filenameLower.endsWith(suffix))) {
          console.log(
            chalk.yellow(
              `Skipping ${file.filename}, it matches unpushable patterns for function ${options.id}`,
            ),
          );
          continue;
        }

        await client.put(`/api/function/${options.id}/file`, {
          filename: file.filename,
          code: file.content,
        });

        const byteSize = Buffer.byteLength(file.content, "utf8");
        console.log(
          chalk.green(
            `Pushed ${file.filename} (${byteSize} bytes) to function ${options.id}`,
          ),
        );
        pushedFilesCount++;
      }

      // Delete files that no longer exist on the remote AFTER pushing new/updated files
      // This avoids the "cannot delete only file" error if we are pushing at least one file.
      try {
        const deletionResult = await deleteNonexistentFiles(
          currentFiles,
          files,
          client,
          options,
        );
        if (deletionResult.didDeletion) {
          didDeletion = true;
        }
      } catch (error: any) {
        if (error.response) {
          console.error(
            chalk.red(
              `Failed to delete files: ${error.response.data?.message || error.response.statusText}`,
            ),
          );
        } else {
          console.error(chalk.red(`Error during deletion: ${error.message}`));
        }
      }

      console.log(
        chalk.green(
          `Successfully pushed ${pushedFilesCount} files to function ${options.id}`,
        ),
      );

      if (didDeletion) {
        console.log("");
        console.log(
          chalk.blue(
            `Hint: We might delete files that you renamed, but don't worry, we'll push the newly named file right after!`,
          ),
        );
      }
    } catch (error: any) {
      if (error.response) {
        console.error(
          chalk.red(
            `Failed to push files: ${error.response.data?.message || error.response.statusText}`,
          ),
        );
      } else if (error.request) {
        console.error(chalk.red("No response received from server."));
      } else {
        console.error(chalk.red(`Error: ${error.message}`));
      }
    }
  },
};
