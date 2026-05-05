import chalk from "chalk";
import { getApiClient } from "../api.js";
import { parseCorsOriginsOption } from "./cors.js";
import { resolveFunctionId } from "./function_commands.js";

export { resolveFunctionId } from "./function_commands.js";

export function validateSingleOrigin(origin: string): { origin?: string; error?: string } {
  const parsed = parseCorsOriginsOption(origin);
  if (parsed.error) return { error: parsed.error };

  const normalized = parsed.corsOrigins?.[0];
  if (!normalized) {
    return { error: "No valid origin provided." };
  }

  return { origin: normalized };
}

export function parseCorsOriginsString(corsOriginsRaw: unknown): string[] {
  if (typeof corsOriginsRaw !== "string") {
    return [];
  }

  return corsOriginsRaw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export async function getFunctionCorsOrigins(functionId: string): Promise<string[]> {
  const client = await getApiClient();
  const response = await client.get(`/api/function/${functionId}/cors-origins`);

  const rawValue =
    response.data?.cors_origins ??
    response.data?.data?.cors_origins ??
    response.data?.data ??
    "";

  return parseCorsOriginsString(rawValue);
}

export async function setFunctionCorsOrigins(functionId: string, origins: string[]): Promise<void> {
  const client = await getApiClient();
  await client.patch(`/api/function/${functionId}/cors-origins`, {
    cors_origins: origins.join(","),
  });
}

export function handleCorsCommandError(error: any, action: string) {
  if (error.response?.status === 404) {
    console.error(`${chalk.red("✗")} Function not found.`);
    return;
  }

  if (error.response) {
    console.error(
      `${chalk.red("✗")} Failed to ${action}: ${chalk.yellow(error.response.data?.message || "Unknown error")}`,
    );
    return;
  }

  if (error.request) {
    console.error(`${chalk.red("✗")} No response received from server.`);
    return;
  }

  console.error(`${chalk.red("✗")} Error: ${error.message}`);
}
