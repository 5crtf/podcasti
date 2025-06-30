interface AppConfig {
    apiUrl: string;
    retryAttempts: number;
    retryDelay: number;
    timeout: number;
}

export const config: AppConfig = {
    apiUrl: 'http://localhost:8000/api',
    retryAttempts: 3,
    retryDelay: 1000, // миллисекунды
    timeout: 5000 // миллисекунды
}; 