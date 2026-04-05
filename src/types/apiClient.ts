// Minimal API client interface used by this CLI. Keep it small so tests can
// provide lightweight mocks without implementing the full AxiosInstance.
export interface ApiClient {
	get(url: string, config?: any): Promise<{ status: number; data: any }>;
	put(url: string, payload?: any, config?: any): Promise<{ status: number; data: any }>;
	delete(url: string, config?: any): Promise<{ status: number; data: any }>;
	patch(url: string, payload?: any, config?: any): Promise<{ status: number; data: any }>;
}

export type { ApiClient as ApiClientType };

