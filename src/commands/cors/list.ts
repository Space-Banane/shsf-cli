import chalk from "chalk";
import { getFunctionCorsOrigins, handleCorsCommandError, resolveFunctionId } from "../../utils/cors_commands.js";

export const listCorsDefinition = {
  name: "list",
  description: "List CORS allowlist origins for a function.",
  options: [{ name: "--id <id>", description: "Function ID (falls back to .shsf.json default id)" }],
  action: async (options: { id?: string }) => {
    const functionId = resolveFunctionId(options);
    if (!functionId) return;

    try {
      const origins = await getFunctionCorsOrigins(functionId);
      if (origins.length === 0) {
        console.log(`${chalk.yellow("!")} No CORS allowlist origins configured for function ${chalk.cyan(functionId)}.`);
        return;
      }

      console.log(`${chalk.blue("CORS Origins")} for function ${chalk.cyan(functionId)}:`);
      origins.forEach((origin) => {
        console.log(`- ${chalk.cyan(origin)}`);
      });
    } catch (error: any) {
      handleCorsCommandError(error, "list CORS origins");
    }
  },
};
