import chalk from "chalk";
import {
  getFunctionCorsOrigins,
  handleCorsCommandError,
  resolveFunctionId,
  setFunctionCorsOrigins,
} from "../../utils/cors_commands.js";

export const clearCorsDefinition = {
  name: "clear",
  description: "Clear all CORS allowlist origins for a function.",
  options: [{ name: "--id <id>", description: "Function ID (falls back to .shsf.json default id)" }],
  action: async (options: { id?: string }) => {
    const functionId = resolveFunctionId(options);
    if (!functionId) return;

    try {
      const currentOrigins = await getFunctionCorsOrigins(functionId);
      if (currentOrigins.length === 0) {
        console.log(`${chalk.yellow("!")} CORS allowlist is already empty for function ${chalk.cyan(functionId)}.`);
        return;
      }

      await setFunctionCorsOrigins(functionId, []);
      console.log(`${chalk.green("✓")} Cleared all CORS origins for function ${chalk.cyan(functionId)}.`);
    } catch (error: any) {
      handleCorsCommandError(error, "clear CORS origins");
    }
  },
};
