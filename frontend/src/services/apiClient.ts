import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError, AxiosInstance } from 'axios';

let baseURL: string;

try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) {
        baseURL = (import.meta as any).env.VITE_API_BASE_URL;
    } else if (process?.env?.VITE_API_BASE_URL) {
        baseURL = process.env.VITE_API_BASE_URL;
    } else {
        baseURL = 'http://localhost:4000/api';
    }
} catch {
    baseURL = process.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
}

export const createApiClient = (): AxiosInstance => {
    const apiClient = axios.create({
        baseURL,
        withCredentials: false, // set false for mock, change for cookie-based auth
        timeout: 10000,
    });

    apiClient.interceptors.request.use(
        ((rawConfig: unknown) => {
            // treat as public request config + arbitrary extras
            const config = rawConfig as InternalAxiosRequestConfig & Record<string, unknown>;
            config.headers = config.headers ?? {};

            /* add authorization header later
             * example: const token = authStore.getState().token;
             * if (token) (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
             */

            return config as any; // satisfy axios with any cast
        }) as any, // avoid interceptor signature mismatch
        (error: AxiosError) => Promise.reject(error)
    );

    apiClient.interceptors.response.use(
        (response: AxiosResponse) => response,
        (error: AxiosError) => {
            if (error.response?.status === 401) {
                console.warn('Unauthorized: redirect to login');
            }

            return Promise.reject(error);
        }
    );

    return apiClient;
};

const defaultClient = createApiClient();
export default defaultClient;
