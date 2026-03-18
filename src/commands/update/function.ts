import chalk from "chalk";
import { getApiClient } from "../../api.js";

export const updateFunctionDefinition = {
  name: "function <id>",
  description: "Update an existing serverless function.",
  options: [
    { name: "--name <name>", description: "Function name" },
    { name: "--description <description>", description: "Function description" },
    { name: "--startup-file <file>", description: "Startup file name" },
    { name: "--execution-alias <alias>", description: "Custom execution alias" },
    { name: "--docker-mount", description: "Enable Docker mount", type: "boolean" },
    { name: "--ffmpeg-install", description: "Install ffmpeg in container", type: "boolean" },
    { name: "--imported", description: "Marks the function as imported", type: "boolean" },
    { name: "--cache-enabled <enabled>", description: "Enable response caching (true/false)" },
    { name: "--cache-ttl <seconds>", description: "Cache TTL in seconds" },
  ],
  action: async (id: string, options: any) => {
    let parsedCacheEnabled: boolean | undefined;
    if (options.cacheEnabled !== undefined) {
      const normalized = String(options.cacheEnabled).toLowerCase();
      if (normalized !== "true" && normalized !== "false") {
        console.error(`${chalk.red("✗")} Invalid value for --cache-enabled. Use true or false.`);
        return;
      }
      parsedCacheEnabled = normalized === "true";
    }

    const parsedCacheTtl = options.cacheTtl !== undefined ? Number(options.cacheTtl) : undefined;
    if (parsedCacheTtl !== undefined && Number.isNaN(parsedCacheTtl)) {
      console.error(`${chalk.red("✗")} Invalid value for --cache-ttl. Please provide a number.`);
      return;
    }

    const data: Record<string, any> = {};

    if (options.name !== undefined) data.name = options.name;
    if (options.description !== undefined) data.description = options.description;
    if (options.startupFile !== undefined) data.startup_file = options.startupFile;
    if (options.executionAlias !== undefined) data.executionAlias = options.executionAlias;
    if (options.dockerMount) data.docker_mount = true;
    if (options.ffmpegInstall) data.ffmpeg_install = true;
    if (options.imported) data.imported = true;
    if (parsedCacheEnabled !== undefined) data.cache_enabled = parsedCacheEnabled;
    if (parsedCacheTtl !== undefined) data.cache_ttl = parsedCacheTtl;

    if (Object.keys(data).length === 0) {
      console.error(`${chalk.red("✗")} No update fields provided. Use --help to see available options.`);
      return;
    }

    const client = await getApiClient();

    try {
      const response = await client.patch(`/api/function/${id}`, data);

      if (response.status === 200) {
        console.log(`${chalk.green("✓")} Function with ID ${chalk.cyan(id)} updated successfully.`);
      } else {
        console.log(`${chalk.yellow("!")} Unexpected response from server: ${response.status}`);
      }
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 404) {
          console.error(`${chalk.red("✗")} Function with ID ${chalk.yellow(id)} not found.`);
        } else {
          console.error(
            `${chalk.red("✗")} Failed to update function: ${chalk.yellow(error.response.data.message || "Unknown error")}`,
          );
        }
      } else {
        console.error(`${chalk.red("✗")} Error: ${error.message}`);
      }
    }
  },
};
