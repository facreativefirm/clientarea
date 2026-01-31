import axios from 'axios';
import { getSessionToken, clearSessionToken, useAuthStore } from './store/authStore';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the session token
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const sessionToken = getSessionToken();
        if (sessionToken) {
            config.headers['X-Session-Token'] = sessionToken;
            console.log('[API] Added session token to request:', config.url);
        } else {
            console.log('[API] No session token found for request:', config.url);
        }
    }
    return config;
});

// Response interceptor to handle session expiration
api.interceptors.response.use(
    (response) => {
        console.log('[API] Response success:', response.config.url, response.status);
        return response;
    },
    async (error) => {
        const status = error.response?.status;
        const url = error.config?.url;
        const isAuthError = (status === 401 || status === 400) && (url?.includes('/auth/login') || url?.includes('/auth/register'));

        if (error.response) {
            const isClientError = status >= 400 && status < 500;
            if (isClientError) {
                // Use warn instead of error for client/validation errors (4xx) to keep console clean
                console.warn(`[API] Client Error: ${url} [${status}]`, error.response.data);
            } else {
                // Server errors (5xx) still deserve red console.error
                console.error(`[API] Server Error: ${url} [${status}]`, error.response.data);
            }
        } else if (error.request) {
            console.error(`[API] Network Error (No response): ${url}`);
        } else {
            console.error(`[API] Request Error: ${error.message}`);
        }

        if (error.response?.status === 401) {
            // Don't redirect if it's a login/register attempt failure
            const isAuthRequest = error.config?.url?.includes('/auth/login') ||
                error.config?.url?.includes('/auth/register') ||
                error.config?.url?.includes('/auth/update-me');

            if (!isAuthRequest && typeof window !== 'undefined') {
                const currentPath = window.location.pathname;

                // Define protected path prefixes
                const protectedPaths = ['/client', '/admin', '/reseller', '/profile'];
                const isProtectedPage = protectedPaths.some(path => currentPath.startsWith(path));

                console.log(`[API] 401 error on ${currentPath}. Protected? ${isProtectedPage}`);

                // CRITICAL: Clear both cookie and Zustand store state
                clearSessionToken();
                useAuthStore.getState().logout();

                if (isProtectedPage) {
                    console.log('[API] Session expired on protected page - redirecting to login');
                    window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
                } else {
                    console.warn('[API] 401 received on public page - cleared local session but stayed on page');
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
