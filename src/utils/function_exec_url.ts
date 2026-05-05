export interface FunctionExecUrlInput {
  namespaceId?: number | string;
  executionId?: string;
  executionAlias?: string | null;
}

export interface FunctionExecUrls {
  executionUrl: string;
  aliasUrl?: string;
}

function normalizeBaseUrl(instanceUrl: string): string {
  return instanceUrl.replace(/\/+$/, "");
}

export function buildFunctionExecUrls(
  instanceUrl: string,
  functionData: FunctionExecUrlInput,
): FunctionExecUrls {
  const baseUrl = normalizeBaseUrl(instanceUrl);

  if (functionData.namespaceId === undefined || !functionData.executionId) {
    throw new Error("Function response is missing execution URL fields.");
  }

  const urls: FunctionExecUrls = {
    executionUrl: `${baseUrl}/api/exec/${functionData.namespaceId}/${functionData.executionId}`,
  };

  if (functionData.executionAlias) {
    urls.aliasUrl = `${baseUrl}/exec/${functionData.executionAlias}`;
  }

  return urls;
}
