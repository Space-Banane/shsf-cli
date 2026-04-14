import chalk from "chalk";
import {
  getFunctionCorsOrigins,
  handleCorsCommandError,
  resolveFunctionId,
  setFunctionCorsOrigins,
  validateSingleOrigin,
} from "../../utils/cors_commands.js";

export const addCorsDefinition = {
  name: "add <origin>",
  description: "Add a CORS allowlist origin (must start with http:// or https://).",
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

      if (currentOrigins.includes(normalizedOrigin)) {
        console.log(`${chalk.yellow("!")} Origin ${chalk.cyan(normalizedOrigin)} already exists for function ${chalk.cyan(functionId)}.`);
        return;
      }

      const updatedOrigins = [...currentOrigins, normalizedOrigin];
      await setFunctionCorsOrigins(functionId, updatedOrigins);

      console.log(`${chalk.green("✓")} Added CORS origin ${chalk.cyan(normalizedOrigin)} to function ${chalk.cyan(functionId)}.`);
    } catch (error: any) {
      handleCorsCommandError(error, "add CORS origin");
    }
  },
};
