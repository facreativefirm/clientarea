"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

interface StoreConfig {
    isReseller: boolean;
    resellerId: number | null;
    brand: {
        name: string;
        primaryColor: string;
        accentColor?: string;
        logoUrl?: string;
        faviconUrl?: string;
        theme?: string;
    } | null;
    loading: boolean;
}

const StoreContext = createContext<StoreConfig>({
    isReseller: false,
    resellerId: null,
    brand: null,
    loading: true,
});

export const useStore = () => useContext(StoreContext);

import { useTheme } from "next-themes";

export function StoreProvider({ children }: { children: React.ReactNode }) {
    const { setTheme } = useTheme();
    const [config, setConfig] = useState<StoreConfig>({
        isReseller: false,
        resellerId: null,
        brand: null,
        loading: true,
    });

    useEffect(() => {
        const fetchStoreConfig = async () => {
            try {
                // Get host from query parameter or actual domain
                const urlParams = new URLSearchParams(window.location.search);
                const debugHost = urlParams.get('host');
                const actualHost = window.location.host;
                const targetHost = (debugHost || actualHost).replace(/^https?:\/\//, '').replace(/\/$/, '');

                console.log(`[Store] Fetching config for host: ${targetHost}`);

                const response = await api.get(`/reseller/config?host=${targetHost}`);
                const { isReseller, resellerId, brandSettings } = response.data.data;

                if (isReseller && brandSettings) {
                    const brand = typeof brandSettings === 'string' ? JSON.parse(brandSettings) : brandSettings;

                    setConfig({
                        isReseller: true,
                        resellerId,
                        brand,
                        loading: false,
                    });

                    // Apply branding
                    if (brand?.primaryColor) {
                        // Injecting into global variables so standard Tailwind primary classes work
                        document.documentElement.style.setProperty('--primary', brand.primaryColor);
                        document.documentElement.style.setProperty('--store-primary', brand.primaryColor);
                        document.documentElement.style.setProperty('--primary-muted', `${brand.primaryColor}20`);
                    }
                    if (brand?.accentColor) {
                        document.documentElement.style.setProperty('--store-accent', brand.accentColor);
                        document.documentElement.style.setProperty('--secondary', brand.accentColor);
                    }
                    if (brand?.theme) {
                        setTheme(brand.theme);
                    }
                    if (brand?.name) {
                        document.title = `${brand.name} - Online Store`;
                    }
                    if (brand?.faviconUrl) {
                        const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
                        if (favicon) {
                            favicon.href = brand.faviconUrl;
                        }
                    }
                } else {
                    // Not a reseller store, show error or redirect
                    setConfig({ isReseller: false, resellerId: null, brand: null, loading: false });
                }
            } catch (err) {
                console.error("[Store] Failed to fetch config:", err);
                setConfig({ isReseller: false, resellerId: null, brand: null, loading: false });
            }
        };

        fetchStoreConfig();
    }, [setTheme]);

    if (config.loading) {
        return (
            <div className="fixed inset-0 bg-white flex items-center justify-center z-[9999]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-semibold text-gray-600 animate-pulse">Loading Store...</p>
                </div>
            </div>
        );
    }

    if (!config.isReseller) {
        return (
            <div className="fixed inset-0 bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md px-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Store Not Found</h1>
                    <p className="text-gray-600 mb-6">This domain is not configured as a reseller store.</p>
                    <a href="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        Go to Main Site
                    </a>
                </div>
            </div>
        );
    }

    return (
        <StoreContext.Provider value={config}>
            {children}
        </StoreContext.Provider>
    );
}
