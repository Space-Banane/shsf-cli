import chalk from "chalk";
import { getApiClient } from "../../api.js";
import { loadConfig } from "../../config.js";
import { resolveFunctionId } from "../../utils/function_commands.js";
import { buildFunctionExecUrls } from "../../utils/function_exec_url.js";

export const getExecUrlDefinition = {
  name: "exec-url",
  description: "Get a function execution URL by its ID.",
  options: [{ name: "--id <id>", description: "Function ID (falls back to .shsf.json default id)" }],
  action: async (options: { id?: string }) => {
    const functionId = resolveFunctionId(options);
    if (!functionId) return;

    await getExecUrl(functionId);
  },
};

async function getExecUrl(functionId: string): Promise<void> {
  const client = await getApiClient();
  const config = await loadConfig();

  try {
    const response = await client.get(`/api/function/${functionId}`);
    const functionData = response.data?.data;

    if (!functionData) {
      console.error(`${chalk.red("✗")} Unexpected response from server.`);
      return;
    }

    if (!functionData.allow_http) {
      console.error(`${chalk.red("✗")} HTTP execution is not allowed for function ${chalk.yellow(functionId)}.`);
      return;
    }

    const urls = buildFunctionExecUrls(config.SHSF_INSTANCE, functionData);

    console.log(`${chalk.blue("Execution URL")} for function ${chalk.cyan(functionId)}:`);
    console.log(chalk.bgGreen.black(` ${urls.executionUrl} `));

    if (urls.aliasUrl) {
      console.log(`${chalk.blue("Alias URL")} for function ${chalk.cyan(functionId)}:`);
      console.log(chalk.bgGreen.black(` ${urls.aliasUrl} `));
    }
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 404) {
        console.error(`${chalk.red("✗")} Function with ID ${chalk.yellow(functionId)} not found.`);
      } else {
        console.error(`${chalk.red("✗")} Failed to fetch function details.`);
        console.error(`Status Code: ${chalk.red(error.response.status)}`);
        console.error(
          `Message: ${chalk.yellow(error.response.data?.message || "Unknown error from server")}`,
        );
      }
    } else if (error.request) {
      console.error(`${chalk.red("✗")} No response received from server.`);
    } else {
      console.error(`${chalk.red("✗")} Error: ${chalk.yellow(error.message)}`);
    }
  }
}
