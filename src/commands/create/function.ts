import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const createFunctionDefinition = {
  name: "function",
  description: "Create a new serverless function.",
  options: [
    { name: "--name <name>", description: "Function name", required: true },
    { name: "--description <description>", description: "Function description", required: true },
    { name: "--image <image>", description: "Docker image tag", required: true },
    { name: "--startup-file <file>", description: "Startup file name", required: true },
    { name: "--namespace-id <id>", description: "Namespace ID", required: true },
    { name: "--execution-alias <alias>", description: "Custom execution alias" },
    { name: "--docker-mount", description: "Enable Docker mount", type: "boolean" },
    { name: "--ffmpeg-install", description: "Install ffmpeg in container", type: "boolean" },
    { name: "--imported", description: "Marks the function as imported", type: "boolean" },
  ],
  action: async (options: any) => {
    const data = {
      name: options.name,
      description: options.description,
      image: options.image,
      startup_file: options.startupFile,
      namespaceId: parseInt(options.namespaceId),
      executionAlias: options.executionAlias,
      docker_mount: !!options.dockerMount,
      ffmpeg_install: !!options.ffmpegInstall,
      imported: !!options.imported,
    };

    const client = await getApiClient();

    try {
      const response = await client.post("/api/function", data);

      if (response.status === 200) {
        console.log(
          `${chalk.green("✓")} Function ${chalk.cyan(data.name)} created successfully! ID: ${chalk.bgGreen.black(` ${response.data.data.id} `)}`,
        );
      } else {
        console.log(
          `${chalk.yellow("!")} Unexpected response from server: ${response.status}`,
        );
      }
    } catch (error: any) {
      if (error.response) {
        console.error(
          `${chalk.red("✗")} Failed to create function: ${chalk.yellow(error.response.data.message || "Unknown error")}`,
        );
      } else {
        console.error(`${chalk.red("✗")} Error: ${error.message}`);
      }
    }
  },
};
