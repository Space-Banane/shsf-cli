import chalk from "chalk";
import {
  getFunctionCorsOrigins,
  handleCorsCommandError,
  resolveFunctionId,
  setFunctionCorsOrigins,
  validateSingleOrigin,
} from "../../utils/cors_commands.js";

export const removeCorsDefinition = {
  name: "remove <origin>",
  description: "Remove a CORS allowlist origin (must start with http:// or https://).",
  options: [{ name: "--id <id>", description: "Function ID (falls back to .shsf.json default id)" }],
  action: async (origin: string, options: { id?: string }) => {
    const functionId = resolveFunctionId(options);
    if (!functionId) return;

    const validated = validateSingleOrigin(origin);
    if (validated.error) {
      console.error(`${chalk.red("✗")} ${validated.error}`);
      return;
    }

    try {
      const currentOrigins = await getFunctionCorsOrigins(functionId);
      const normalizedOrigin = validated.origin as string;

      if (!currentOrigins.includes(normalizedOrigin)) {
        console.log(`${chalk.yellow("!")} Origin ${chalk.cyan(normalizedOrigin)} is not set for function ${chalk.cyan(functionId)}.`);
        return;
      }

      const updatedOrigins = currentOrigins.filter((existingOrigin) => existingOrigin !== normalizedOrigin);
      await setFunctionCorsOrigins(functionId, updatedOrigins);

      console.log(`${chalk.green("✓")} Removed CORS origin ${chalk.cyan(normalizedOrigin)} from function ${chalk.cyan(functionId)}.`);
    } catch (error: any) {
      handleCorsCommandError(error, "remove CORS origin");
    }
  },
};
