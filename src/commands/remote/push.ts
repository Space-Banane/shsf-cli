import chalk from "chalk";
import { getApiClient } from "../../api.js";
import fs from "fs";
import path from "path";
import { createHash } from "crypto";

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
      );} catch (error: any) {
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

    const files = fs.readdirSync(options.from).map((file) => ({
      filename: file,
      content: fs.readFileSync(path.join(options.from, file), "utf-8"),
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
          // If the file content exists in the response, we can hash it. 
          // Note: currentFiles from /api/function/:id/files might not have content by default depending on API,
          // but the original code assumes it does.
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

        await client.put(`/api/function/${options.id}/file`, {
          filename: file.filename,
          code: file.content,
        });

        console.log(
          chalk.green(`Pushed ${file.filename} to function ${options.id}`),
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
