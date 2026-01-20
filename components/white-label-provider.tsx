"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";
import { useSettingsStore } from "@/lib/store/settingsStore";

interface WhiteLabelBrand {
    name: string;
    primaryColor: string;
    logoUrl?: string;
    faviconUrl?: string;
    accentColor?: string;
    theme?: string;
}

interface WhiteLabelContextType {
    isReseller: boolean;
    resellerId: number | null;
    brand: WhiteLabelBrand | null;
    loading: boolean;
}

const WhiteLabelContext = createContext<WhiteLabelContextType>({
    isReseller: false,
    resellerId: null,
    brand: null,
    loading: true,
});

export const useWhiteLabel = () => useContext(WhiteLabelContext);

export function WhiteLabelProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<WhiteLabelContextType>({
        isReseller: false,
        resellerId: null,
        brand: null,
        loading: true,
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                // In production, window.location.host would be something like 'store.naimur.com'
                const host = window.location.host;

                // Allow testing via query parameter for development
                const urlParams = new URLSearchParams(window.location.search);
                const debugHost = urlParams.get('__reseller_host');
                const rawHost = debugHost || host;
                const targetHost = rawHost.replace(/^https?:\/\//, '').replace(/\/$/, '');

                const response = await api.get(`/reseller/config?host=${targetHost}`);
                const { isReseller, resellerId, brandSettings } = response.data.data;

                if (isReseller) {
                    const brand = typeof brandSettings === 'string' ? JSON.parse(brandSettings) : brandSettings;

                    setConfig({
                        isReseller: true,
                        resellerId,
                        brand,
                        loading: false,
                    });

                    // Inject Dynamic Theming
                    if (brand?.primaryColor) {
                        document.documentElement.style.setProperty('--primary', brand.primaryColor);
                        document.documentElement.style.setProperty('--primary-muted', `${brand.primaryColor}20`);
                    }

                    // Dynamic Title & Global App Name Sync
                    if (brand?.name || brand?.siteTitle) {
                        const displayTitle = brand.siteTitle || `${brand.name} | Powering Your Growth`;
                        document.title = displayTitle;

                        // Force update global settings store so Navbar updates immediately
                        useSettingsStore.setState((state) => ({
                            settings: { ...state.settings, appName: brand.name || state.settings.appName }
                        }));
                    }

                    // Dynamic Meta Description
                    if (brand?.metaDescription) {
                        let metaDesc = document.querySelector("meta[name='description']");
                        if (!metaDesc) {
                            metaDesc = document.createElement('meta');
                            (metaDesc as HTMLMetaElement).name = 'description';
                            document.head.appendChild(metaDesc);
                        }
                        (metaDesc as HTMLMetaElement).content = brand.metaDescription;
                    }

                    // Dynamic Favicon
                    if (brand?.faviconUrl) {
                        const existingFavicon = document.querySelector("link[rel*='icon']");
                        if (existingFavicon) {
                            (existingFavicon as HTMLLinkElement).href = brand.faviconUrl;
                        } else {
                            const newFavicon = document.createElement('link');
                            newFavicon.rel = 'icon';
                            newFavicon.href = brand.faviconUrl;
                            document.head.appendChild(newFavicon);
                        }
                    }
                } else {
                    setConfig(prev => ({ ...prev, loading: false }));
                }
            } catch (err) {
                console.error("WhiteLabel Intelligence Error:", err);
                setConfig(prev => ({ ...prev, loading: false }));
            }
        };

        fetchConfig();
    }, []);

    return (
        <WhiteLabelContext.Provider value={config}>
            {!config.loading && children}
            {config.loading && (
                <div className="fixed inset-0 bg-background flex items-center justify-center z-[9999]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs font-black uppercase tracking-[0.2em] animate-pulse">Initializing Virtual Storefront...</p>
                    </div>
                </div>
            )}
        </WhiteLabelContext.Provider>
    );
}
