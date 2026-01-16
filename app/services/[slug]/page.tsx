"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/landing/Footer";
import { useLanguage } from "@/components/language-provider";
import { motion, AnimatePresence } from "framer-motion";
import { PricingCard } from "@/components/landing/PricingCard";
import api from "@/lib/api";
import { Loader2, Server, Globe, Database, Cloud, ChevronRight, Zap, ShieldCheck } from "lucide-react";
import { useSettingsStore } from "@/lib/store/settingsStore";

export default function ServiceCategoryPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { t } = useLanguage();
    const { formatPrice } = useSettingsStore();

    const [group, setGroup] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [servicesRes, productsRes] = await Promise.all([
                    api.get("/products/services"),
                    api.get("/products")
                ]);

                const services = servicesRes.data.data.services || [];
                const foundGroup = services.find((s: any) => s.slug === slug);

                if (foundGroup) {
                    setGroup(foundGroup);
                    const allProducts = productsRes.data.data.products || [];
                    setProducts(allProducts.filter((p: any) => p.serviceId === foundGroup.id));
                }
            } catch (error) {
                console.error("Failed to fetch service data", error);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchData();
    }, [slug]);

    const getIcon = () => {
        switch (group?.slug?.toUpperCase()) {
            case 'HOSTING': return Globe;
            case 'VPS': return Server;
            case 'RESELLER': return Database;
            default: return Cloud;
        }
    };

    const Icon = getIcon();

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <PublicNavbar />
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Infrastructure...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (!group) {
        return (
            <div className="min-h-screen bg-white">
                <PublicNavbar />
                <div className="flex flex-col items-center justify-center py-40 text-center px-6">
                    <h1 className="text-4xl font-black text-gray-900 mb-4">Service Not Found</h1>
                    <p className="text-gray-500 mb-8">The requested hosting category does not exist in our registry.</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans">
            <PublicNavbar />

            <main className="pt-32 pb-20">
                {/* Category Hero */}
                <div className="relative overflow-hidden mb-20">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
                            <div className="max-w-3xl">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-3 text-primary font-black uppercase text-xs tracking-[0.3em] mb-6"
                                >
                                    <Icon size={18} />
                                    Managed Portfolio
                                </motion.div>
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight"
                                >
                                    {group.name}
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-xl text-gray-500 leading-relaxed"
                                >
                                    {group.description || `Deploy enterprise-grade ${group.name} solutions with BDIX optimization and 24/7 technical oversight.`}
                                </motion.p>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-gray-900 rounded-[2rem] p-8 text-white w-full lg:w-96 shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Zap size={100} />
                                </div>
                                <div className="relative z-10">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Network Status</div>
                                    <div className="flex items-center gap-2 mb-6 text-sm font-bold">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        Cluster is 100% Operational
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                                            <span className="text-gray-400">Latency (Local)</span>
                                            <span className="text-primary font-bold">&lt; 5ms</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                                            <span className="text-gray-400">Redundancy</span>
                                            <span className="text-primary font-bold">N+1 Grid</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-400">Backups</span>
                                            <span className="text-primary font-bold">Hourly Snapshots</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map((product, i) => (
                            <PricingCard key={product.id} product={product} index={i} />
                        ))}
                    </div>

                    {products.length === 0 && (
                        <div className="text-center py-32 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
                            <Cloud size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No active plans in this category</h3>
                            <p className="text-gray-500">Check back soon or contact support for customized solutions.</p>
                        </div>
                    )}
                </div>

                {/* Features Highlights */}
                <div className="max-w-7xl mx-auto px-6 mt-32">
                    <div className="bg-primary/5 rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
                            {[
                                { title: "Intel NVMe", desc: "Enterprise storage with 1 million IOPS", icon: Zap },
                                { title: "DDoS Guard", desc: "Advanced filtering for all incoming traffic", icon: ShieldCheck },
                                { title: "BDIX Ready", desc: "Peered with all major local ISPs", icon: Globe },
                                { title: "Auto-Scale", desc: "Easily upgrade resources as you grow", icon: Rocket }
                            ].map((f, i) => (
                                <div key={i} className="space-y-4">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm border border-primary/10">
                                        <f.icon size={24} />
                                    </div>
                                    <h4 className="font-bold text-gray-900">{f.title}</h4>
                                    <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

// Fixed imports for the writing tool
import { Rocket } from "lucide-react";
