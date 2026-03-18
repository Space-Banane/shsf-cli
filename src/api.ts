import axios, { AxiosInstance } from 'axios';
import { loadConfig } from './config.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

let apiClient: AxiosInstance | null = null;

export async function getApiClient(): Promise<AxiosInstance> {
  if (apiClient) return apiClient;

  const config = await loadConfig();
  
  apiClient = axios.create({
    baseURL: config.SHSF_INSTANCE,
    headers: {
      'x-access-key': config.SHSF_TOKEN,
      'Content-Type': 'application/json',
      "User-Agent": "SHSF-CLI/" + pkg.version
    },
  });

  return apiClient;
}
