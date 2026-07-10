import { getApiClient } from "../api.js";

let nextJsonRpcId = 1;

export async function callMcp(method: string, params?: unknown): Promise<unknown> {
  const client = await getApiClient();
  const id = nextJsonRpcId++;
  const response = await client.post("/mcp", {
    jsonrpc: "2.0",
    id,
    method,
    ...(params !== undefined ? { params } : {}),
  });

  if (response.data?.error) {
    throw new Error(response.data.error.message || JSON.stringify(response.data.error));
  }

  return response.data?.result ?? response.data;
}
