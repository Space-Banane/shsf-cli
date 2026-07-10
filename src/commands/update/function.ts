import chalk from "chalk";
import { getApiClient } from "../../api.js";

function parseBooleanOption(value: unknown, optionName: string): boolean | undefined {
  if (value === undefined) return undefined;
  const normalized = String(value).toLowerCase();
  if (normalized !== "true" && normalized !== "false") {
    throw new Error(`Invalid value for ${optionName}. Use true or false.`);
  }
  return normalized === "true";
}

function parseNumberOption(value: unknown, optionName: string): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid value for ${optionName}. Please provide a number.`);
  }
  return parsed;
}

export const updateFunctionDefinition = {
  name: "function <id>",
  description: "Update an existing serverless function.",
  options: [
    { name: "--name <name>", description: "Function name" },
    { name: "--description <description>", description: "Function description" },
    { name: "--image <image>", description: "Runtime image tag within the existing language family" },
    { name: "--startup-file <file>", description: "Startup file name" },
    { name: "--namespace-id <id>", description: "Move function to namespace ID" },
    { name: "--execution-alias <alias>", description: "Custom execution alias" },
    { name: "--docker-mount <enabled>", description: "Enable Docker mount (true/false)" },
    { name: "--network-restricted <enabled>", description: "Disable outbound network access (true/false)" },
    { name: "--ffmpeg-install <enabled>", description: "Install ffmpeg in container (true/false)" },
    { name: "--opencv-install <enabled>", description: "Install opencv in container (true/false)" },
    { name: "--imported <enabled>", description: "Marks the function as imported (true/false)" },
    { name: "--ai-kicked-off <enabled>", description: "Marks the function as created via AI kickoff (true/false)" },
    { name: "--allow-http <enabled>", description: "Allow HTTP execution (true/false)" },
    { name: "--secure-header <value>", description: "Require x-secure-header for HTTP execution" },
    { name: "--clear-secure-header", description: "Remove the secure header requirement", type: "boolean" },
    { name: "--max-ram <mb>", description: "Max RAM in MB" },
    { name: "--timeout <seconds>", description: "Execution timeout in seconds" },
    { name: "--tags <csv>", description: "Comma-separated function tags" },
    { name: "--retry-on-failure <enabled>", description: "Retry failed executions (true/false)" },
    { name: "--retry-count <count>", description: "Retry count" },
    { name: "--cache-enabled <enabled>", description: "Enable response caching (true/false)" },
    { name: "--cache-ttl <seconds>", description: "Cache TTL in seconds" },
    { name: "--cors-origins <origins>", description: "Comma-separated allowed CORS origins" },
  ],
  action: async (id: string, options: any) => {
    let dockerMount: boolean | undefined;
    let networkRestricted: boolean | undefined;
    let ffmpegInstall: boolean | undefined;
    let opencvInstall: boolean | undefined;
    let imported: boolean | undefined;
    let aiKickedOff: boolean | undefined;
    let allowHttp: boolean | undefined;
    let retryOnFailure: boolean | undefined;
    let cacheEnabled: boolean | undefined;
    let namespaceId: number | undefined;
    let maxRam: number | undefined;
    let timeout: number | undefined;
    let retryCount: number | undefined;
    let cacheTtl: number | undefined;

    try {
      dockerMount = parseBooleanOption(options.dockerMount, "--docker-mount");
      networkRestricted = parseBooleanOption(options.networkRestricted, "--network-restricted");
      ffmpegInstall = parseBooleanOption(options.ffmpegInstall, "--ffmpeg-install");
      opencvInstall = parseBooleanOption(options.opencvInstall, "--opencv-install");
      imported = parseBooleanOption(options.imported, "--imported");
      aiKickedOff = parseBooleanOption(options.aiKickedOff, "--ai-kicked-off");
      allowHttp = parseBooleanOption(options.allowHttp, "--allow-http");
      retryOnFailure = parseBooleanOption(options.retryOnFailure, "--retry-on-failure");
      cacheEnabled = parseBooleanOption(options.cacheEnabled, "--cache-enabled");
      namespaceId = parseNumberOption(options.namespaceId, "--namespace-id");
      maxRam = parseNumberOption(options.maxRam, "--max-ram");
      timeout = parseNumberOption(options.timeout, "--timeout");
      retryCount = parseNumberOption(options.retryCount, "--retry-count");
      cacheTtl = parseNumberOption(options.cacheTtl, "--cache-ttl");
    } catch (error: any) {
      console.error(`${chalk.red("✗")} ${error.message}`);
      return;
    }

    const data: Record<string, any> = {};
    const settings: Record<string, any> = {};

    if (options.name !== undefined) data.name = options.name;
    if (options.description !== undefined) data.description = options.description;
    if (options.image !== undefined) data.image = options.image;
    if (options.startupFile !== undefined) data.startup_file = options.startupFile;
    if (namespaceId !== undefined) data.namespaceId = namespaceId;
    if (options.executionAlias !== undefined) data.executionAlias = options.executionAlias;
    if (dockerMount !== undefined) data.docker_mount = dockerMount;
    if (networkRestricted !== undefined) data.network_restricted = networkRestricted;
    if (ffmpegInstall !== undefined) data.ffmpeg_install = ffmpegInstall;
    if (opencvInstall !== undefined) data.opencv_install = opencvInstall;
    if (imported !== undefined) data.imported = imported;
    if (aiKickedOff !== undefined) data.ai_kicked_off = aiKickedOff;
    if (options.corsOrigins !== undefined) data.cors_origins = options.corsOrigins;
    if (allowHttp !== undefined) settings.allow_http = allowHttp;
    if (options.clearSecureHeader) settings.secure_header = null;
    if (options.secureHeader !== undefined) settings.secure_header = options.secureHeader;
    if (maxRam !== undefined) settings.max_ram = maxRam;
    if (timeout !== undefined) settings.timeout = timeout;
    if (options.tags !== undefined) {
      settings.tags = String(options.tags)
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
    }
    if (retryOnFailure !== undefined) settings.retry_on_failure = retryOnFailure;
    if (retryCount !== undefined) settings.retry_count = retryCount;
    if (cacheEnabled !== undefined) settings.cache_enabled = cacheEnabled;
    if (cacheTtl !== undefined) settings.cache_ttl = cacheTtl;
    if (Object.keys(settings).length > 0) data.settings = settings;

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
