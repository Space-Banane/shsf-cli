import chalk from "chalk";
import type { ApiClient } from "../types/apiClient.js";

export async function listFiles(client: ApiClient, functionId: string) {
  const response = await client.get(`/api/function/${functionId}/files`);
  if (response.status === 200) return response.data.data || [];
  throw new Error(`Unexpected status ${response.status}`);
}

export async function createOrUpdateFile(client: ApiClient, functionId: string, filename: string, code: string) {
  const payload = { filename, code };
  const response = await client.put(`/api/function/${functionId}/file`, payload);
  if (response.status === 200 || response.status === 201) return response.data;
  throw new Error(`Unexpected status ${response.status}`);
}

export async function deleteFile(client: ApiClient, functionId: string, fileId: string, filename?: string) {
  // Some endpoints expect filename on body; include if provided.
  const opts: any = {};
  if (filename) opts.data = { filename };
  const response = await client.delete(`/api/function/${functionId}/file/${fileId}`, opts);
  if (response.status === 200) return true;
  throw new Error(`Unexpected status ${response.status}`);
}

export async function renameFile(client: ApiClient, functionId: string, fileId: string, newFilename: string) {
  const response = await client.patch(
    `/api/function/${functionId}/file/${fileId}/rename`,
    { newFilename },
  );
  if (response.status === 200) return response.data;
  throw new Error(`Unexpected status ${response.status}`);
}

export function handleAxiosError(error: any) {
  if (error.response) {
    // If the server signals a CLI file failure, stop further commands.
    if (error.response.data?.cli_file_fail) {
      console.error(`${chalk.red("✗")} ${error.response.data.message || "File operation blocked by server. (Probably because git is configured)"}`);
      return { errorType: "cli_file_fail", reason: error.response.data.cli_file_fail, details: error.response };
    }
    if (error.response.status === 404) {
      console.error(`${chalk.red("✗")} Not found.`);
      return { errorType: "notfound" };
    }
    console.error(`${chalk.red("✗")} ${error.response.data?.message || error.response.statusText}`);
    return { errorType: "response", details: error.response };
  }
  if (error.request) {
    console.error(`${chalk.red("✗")} No response received from server.`);
    return { errorType: "norequest" };
  }
  console.error(`${chalk.red("✗")} Error: ${error.message}`);
  return { errorType: "other" };
}

export default {
  listFiles,
  createOrUpdateFile,
  deleteFile,
  renameFile,
  handleAxiosError,
};
