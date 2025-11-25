
// api.ts

interface Config {
    BASE_API_URL: string;
    USER_AUTH_JWT_TOKEN: string;
}

// Singleton promise to fetch and parse the config file, ensuring it only happens once.
let configPromise: Promise<Config> | null = null;

const getConfig = (): Promise<Config> => {
    if (!configPromise) {
        // Use relative path to config.json to allow subdirectory deployment
        configPromise = fetch('config.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to load configuration");
                }
                return response.json();
            });
    }
    return configPromise;
};

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    // Handle 204 No Content for DELETE requests
    if (response.status === 204) {
        return {} as any;
    }
    return response.json();
};

const makeRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const config = await getConfig();
    const headers = new Headers(options.headers || {});
    
    // Add the Authorization header to every request
    headers.set('Authorization', `Bearer ${config.USER_AUTH_JWT_TOKEN}`);

    // Set Content-Type for requests with a body
    if (options.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }
    
    // Construct the full URL
    const fullUrl = `${config.BASE_API_URL}api/v1/${endpoint}`;
    
    const response = await fetch(fullUrl, {
        ...options,
        headers,
    });
    
    return handleResponse(response);
};

// FIX: Add exported types for API payloads to resolve import errors.
export interface ProfileUpdatePayload {
    first_name: string;
    last_name: string;
    company: string;
    role: string;
}

export interface WorkspaceUpdatePayload {
    brand_name: string;
    industry: string;
    website_url: string;
    competitors: string[];
}

export interface McpServerUpdatePayload {
    server_url: string;
    api_key: string;
}

export interface PrivacyUpdatePayload {
    historical_data_days: number;
    refresh_frequency_hours: number;
}

export interface SuggestionRequest {
    query: string;
}

const api = {
    get: <T>(endpoint: string): Promise<T> => {
        return makeRequest<T>(endpoint, { method: 'GET' });
    },
    post: <T>(endpoint: string, body: any): Promise<T> => {
        return makeRequest<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },
    put: <T>(endpoint: string, body: any): Promise<T> => {
        return makeRequest<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    },
    patch: <T>(endpoint: string, body: any): Promise<T> => {
        return makeRequest<T>(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    },
    delete: async <T>(endpoint: string): Promise<T> => {
        return makeRequest<T>(endpoint, { method: 'DELETE' });
    },
};

export { api };