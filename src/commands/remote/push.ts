import chalk from "chalk";
import { getApiClient } from "../../api.js";
import fs from "fs";
import path from "path";
import {
  defaultUnpushableFiles,
  readIgnoreFile,
  matchesAnyPattern,
  readMappingFile,
} from "../../utils/push_helpers.js";
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
    { name: "--id <id>", description: "Function ID" },
    { name: "--from <path>", description: "Source directory" },
    { name: "--force", description: "Force overwrite" },
  ],
  action: async (options: any) => {
    const client = await getApiClient();

    // Load mapping if options are missing
    const mapping = readMappingFile();
    if (!options.id && mapping?.id) {
      options.id = mapping.id;
      console.log(chalk.blue(`Using mapped id ${options.id} from .shsf.json`));
    }
    if (!options.from && mapping?.from) {
      options.from = mapping.from;
      console.log(chalk.blue(`Using mapped from ${options.from} from .shsf.json`));
    }

    const hadMapping = !!mapping;

    if (!options.from) {
      console.error(chalk.red("Source path not provided."));
      return;
    }

    if (!fs.existsSync(options.from)) {
      console.error(chalk.red(`Source ${options.from} does not exist.`));
      return;
    }
    let didDeletion = false; // Track if any deletions were made

    const currentFilesResponse = await client.get(
      `/api/function/${options.id}/files`,
    );
    const currentFiles = currentFilesResponse.data.data; // Expecting { name: string, id: string [...] }[]

    // Read ignore patterns from .shsfignore (in source dir or cwd) and merge with defaults
    const customPatterns = readIgnoreFile(options.from);
    const combinedPatterns = [...defaultUnpushableFiles, ...customPatterns];

    // Read local files and filter to only include files (exclude directories)
    const files = fs
      .readdirSync(options.from)
      .map((file) => {
        const filePath = path.join(options.from, file);
        return { filename: file, filePath };
      })
      .filter(({ filePath }) => fs.statSync(filePath).isFile())
      .filter(({ filename }) => !matchesAnyPattern(filename, combinedPatterns))
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
        // Unpushable file check (also check custom patterns)
        if (matchesAnyPattern(filenameLower, combinedPatterns)) {
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

      // If there was no mapping file and the user provided --id and --from, create a .shsf.json
      if (!hadMapping && options.id && options.from) {
        try {
          const mapPath = path.join(process.cwd(), ".shsf.json");
          if (!fs.existsSync(mapPath)) {
            const data = { default: { id: options.id, from: options.from } };
            fs.writeFileSync(mapPath, JSON.stringify(data, null, 2), { encoding: "utf-8" });
            console.log("");
            console.log(
              chalk.green(`Wrote .shsf.json mapping to ${mapPath}`),
            );
            console.log(
              chalk.blue(
                `Tip: Next time you can omit --id and --from — the CLI will use values from .shsf.json`,
              ),
            );
          }
        } catch (err: any) {
          console.error(chalk.yellow(`Could not write .shsf.json: ${err?.message || err}`));
        }
      }

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
