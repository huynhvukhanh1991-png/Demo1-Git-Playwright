import { APIRequestContext } from '@playwright/test';
import { API_RESPONSE_CODES } from '../tests/config/constants';

export interface ApiResponse<T> {
    status: number;
    statusText: string;
    data?: T;
    error?: string;
}

export interface ApiRequestOptions {
    headers?: Record<string, string>;
    timeout?: number;
    retries?: number;
}

/**
 * Centralized API Client for managing all HTTP requests
 * Provides consistent error handling, logging, and response parsing
 */
export class ApiClient {
    private request: APIRequestContext;
    private baseURL: string;
    private defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    constructor(request: APIRequestContext, baseURL: string) {
        this.request = request;
        this.baseURL = baseURL;
    }

    /**
     * Set authorization header (for bearer tokens)
     */
    setAuthToken(token: string) {
        this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    /**
     * Perform GET request
     */
    async get<T = any>(
        endpoint: string,
        options?: ApiRequestOptions
    ): Promise<ApiResponse<T>> {
        return this.performRequest<T>('GET', endpoint, undefined, options);
    }

    /**
     * Perform POST request
     */
    async post<T = any>(
        endpoint: string,
        data?: any,
        options?: ApiRequestOptions
    ): Promise<ApiResponse<T>> {
        return this.performRequest<T>('POST', endpoint, data, options);
    }

    /**
     * Perform PUT request
     */
    async put<T = any>(
        endpoint: string,
        data?: any,
        options?: ApiRequestOptions
    ): Promise<ApiResponse<T>> {
        return this.performRequest<T>('PUT', endpoint, data, options);
    }

    /**
     * Perform DELETE request
     */
    async delete<T = any>(
        endpoint: string,
        options?: ApiRequestOptions
    ): Promise<ApiResponse<T>> {
        return this.performRequest<T>('DELETE', endpoint, undefined, options);
    }

    /**
     * Perform PATCH request
     */
    async patch<T = any>(
        endpoint: string,
        data?: any,
        options?: ApiRequestOptions
    ): Promise<ApiResponse<T>> {
        return this.performRequest<T>('PATCH', endpoint, data, options);
    }

    /**
     * Core request method with error handling and retries
     */
    private async performRequest<T = any>(
        method: string,
        endpoint: string,
        data?: any,
        options?: ApiRequestOptions,
        attempt: number = 1
    ): Promise<ApiResponse<T>> {
        try {
            const url = this.buildUrl(endpoint);
            const headers = { ...this.defaultHeaders, ...options?.headers };
            const timeout = options?.timeout;

            const response = await this.request.fetch(url, {
                method,
                headers,
                data: data ? JSON.stringify(data) : undefined,
                timeout,
            });

            const responseBody = await response.json().catch(() => null);
            const statusCode = response.status();

            const apiResponse: ApiResponse<T> = {
                status: statusCode,
                statusText: response.statusText(),
                data: responseBody,
            };

            // Log for debugging
            console.log(`[API] ${method} ${endpoint} - ${statusCode}`);

            if (!this.isSuccessStatus(statusCode)) {
                apiResponse.error = responseBody?.message || response.statusText();
                console.error(`[API Error] ${method} ${endpoint} - ${statusCode}:`, apiResponse.error);
            }

            return apiResponse;
        } catch (error) {
            const maxRetries = options?.retries ?? 1;
            if (attempt < maxRetries) {
                console.log(`[API] Retry attempt ${attempt} for ${endpoint}`);
                return this.performRequest(method, endpoint, data, options, attempt + 1);
            }

            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`[API Request Failed] ${method} ${endpoint}:`, errorMessage);

            return {
                status: 0,
                statusText: 'Request Failed',
                error: errorMessage,
            };
        }
    }

    /**
     * Check if status code indicates success
     */
    private isSuccessStatus(status: number): boolean {
        return status >= API_RESPONSE_CODES.SUCCESS && status < 300;
    }

    /**
     * Build full URL from endpoint
     */
    private buildUrl(endpoint: string): string {
        if (endpoint.startsWith('http')) {
            return endpoint;
        }
        return `${this.baseURL}${endpoint}`;
    }
}
