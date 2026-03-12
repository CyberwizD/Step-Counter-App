import { Platform } from 'react-native';

// Use your machine's local IP for physical device testing
// On emulator, 10.0.2.2 maps to host localhost
const getBaseUrl = () => {
    if (Platform.OS === 'android') {
        return 'http://localhost:8080';
    }
    // iOS simulator or web
    return 'http://localhost:8080';
};

const BASE_URL = getBaseUrl();

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
    const url = `${BASE_URL}${path}`;
    const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
}

// Step types matching the backend models
export interface TodayStats {
    total_steps: number;
    total_calories: number;
    total_distance_km: number;
    total_duration_minutes: number;
    daily_goal: number;
    progress_percent: number;
}

export interface DailySummary {
    date: string;
    total_steps: number;
    total_calories: number;
    total_distance_km: number;
    total_duration_minutes: number;
    session_count: number;
}

export interface StepSession {
    id: number;
    steps: number;
    calories: number;
    distance_km: number;
    duration_minutes: number;
    recorded_at: string;
}

export interface Settings {
    id: number;
    daily_goal: number;
    unit: string;
    notifications_enabled: boolean;
}

// API functions
export const api = {
    // Steps
    logSteps: (steps: number, durationMinutes?: number) =>
        request<{ id: number }>('POST', '/api/steps', { steps, duration_minutes: durationMinutes }),

    getTodayStats: () =>
        request<TodayStats>('GET', '/api/steps/today'),

    getWeeklyStats: () =>
        request<DailySummary[]>('GET', '/api/steps/weekly'),

    getHistory: () =>
        request<StepSession[]>('GET', '/api/steps/history'),

    // Settings
    getSettings: () =>
        request<Settings>('GET', '/api/settings'),

    updateSettings: (data: Partial<Omit<Settings, 'id'>>) =>
        request<Settings>('PUT', '/api/settings', data),
};
