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

export const createFunctionDefinition = {
  name: "function",
  description: "Create a new serverless function.",
  options: [
    { name: "--name <name>", description: "Function name", required: true },
    { name: "--description <description>", description: "Function description", required: true },
    { name: "--image <image>", description: "Docker image tag", required: true },
    { name: "--startup-file <file>", description: "Startup file name (optional for .NET runtimes)" },
    { name: "--namespace-id <id>", description: "Namespace ID", required: true },
    { name: "--execution-alias <alias>", description: "Custom execution alias" },
    { name: "--docker-mount", description: "Enable Docker mount", type: "boolean" },
    { name: "--network-restricted", description: "Disable outbound network access", type: "boolean" },
    { name: "--ffmpeg-install", description: "Install ffmpeg in container", type: "boolean" },
    { name: "--opencv-install", description: "Install opencv in container", type: "boolean" },
    { name: "--imported", description: "Marks the function as imported", type: "boolean" },
    { name: "--ai-kicked-off", description: "Marks the function as created via AI kickoff", type: "boolean" },
    { name: "--allow-http <enabled>", description: "Allow HTTP execution (true/false)" },
    { name: "--secure-header <value>", description: "Require x-secure-header for HTTP execution" },
    { name: "--max-ram <mb>", description: "Max RAM in MB" },
    { name: "--timeout <seconds>", description: "Execution timeout in seconds" },
    { name: "--tags <csv>", description: "Comma-separated function tags" },
    { name: "--retry-on-failure <enabled>", description: "Retry failed executions (true/false)" },
    { name: "--retry-count <count>", description: "Retry count" },
    { name: "--cache-enabled <enabled>", description: "Enable response caching (true/false)" },
    { name: "--cache-ttl <seconds>", description: "Cache TTL in seconds" },
    { name: "--cors-origins <origins>", description: "Comma-separated allowed CORS origins" },
  ],
  action: async (options: any) => {
    let allowHttp: boolean | undefined;
    let retryOnFailure: boolean | undefined;
    let cacheEnabled: boolean | undefined;
    let maxRam: number | undefined;
    let timeout: number | undefined;
    let retryCount: number | undefined;
    let cacheTtl: number | undefined;

    try {
      allowHttp = parseBooleanOption(options.allowHttp, "--allow-http");
      retryOnFailure = parseBooleanOption(options.retryOnFailure, "--retry-on-failure");
      cacheEnabled = parseBooleanOption(options.cacheEnabled, "--cache-enabled");
      maxRam = parseNumberOption(options.maxRam, "--max-ram");
      timeout = parseNumberOption(options.timeout, "--timeout");
      retryCount = parseNumberOption(options.retryCount, "--retry-count");
      cacheTtl = parseNumberOption(options.cacheTtl, "--cache-ttl");
    } catch (error: any) {
      console.error(`${chalk.red("✗")} ${error.message}`);
      return;
    }

    const settings: Record<string, any> = {};
    if (allowHttp !== undefined) settings.allow_http = allowHttp;
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

    const data = {
      name: options.name,
      description: options.description,
      image: options.image,
      startup_file: options.startupFile ?? "",
      namespaceId: parseInt(options.namespaceId),
      executionAlias: options.executionAlias,
      docker_mount: !!options.dockerMount,
      network_restricted: !!options.networkRestricted,
      ffmpeg_install: !!options.ffmpegInstall,
      opencv_install: !!options.opencvInstall,
      imported: !!options.imported,
      ai_kicked_off: !!options.aiKickedOff,
      cors_origins: options.corsOrigins,
      ...(Object.keys(settings).length > 0 ? { settings } : {}),
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
