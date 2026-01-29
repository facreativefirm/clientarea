"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Server, Database, Globe, Cloud, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingCard } from "./PricingCard";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useSettingsStore } from "@/lib/store/settingsStore";

import { useRouter } from "next/navigation";

export function ServiceGroupList() {
    const { language } = useLanguage();
    const router = useRouter();
    const { formatPrice } = useSettingsStore();
    const [groups, setGroups] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const rawHost = urlParams.get('__reseller_host') || window.location.host;
                // Sanitize protocol and trailing slash before sending
                const host = encodeURIComponent(rawHost.replace(/^https?:\/\//, '').replace(/\/$/, ''));

                const [groupsRes, productsRes] = await Promise.all([
                    api.get("/products/services"),
                    api.get(`/products?host=${host}`)
                ]);
                setGroups(groupsRes.data.data.services || []);
                setProducts(productsRes.data.data.products || []);
            } catch (error) {
                console.error("Failed to fetch services", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getGroupIcon = (type: string) => {
        switch (type?.toUpperCase()) {
            case 'HOSTING': return Globe;
            case 'VPS': return Server;
            case 'RESELLER': return Database;
            default: return Cloud;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <section className="py-24 px-6 max-w-7xl mx-auto min-h-[600px]" id="hosting">
            <motion.div
                initial={{ opacity: 0, scale: 0.99 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Choose Your Solution</h2>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Explore our premium hosting and infrastructure offerings.
                    </p>
                </div>

                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    variants={{
                        hidden: { opacity: 0 },
                        show: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.05
                            }
                        }
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {groups.map((group, index) => {
                        const Icon = getGroupIcon(group.slug);
                        const groupProducts = products.filter(p => p.serviceId === group.id);
                        const productCount = groupProducts.length;
                        const minPrice = productCount > 0
                            ? Math.min(...groupProducts.map(p => p.monthlyPrice))
                            : null;

                        return (
                            <motion.div
                                key={group.id}
                                variants={{
                                    hidden: { opacity: 0, y: 15 },
                                    show: { opacity: 1, y: 0 }
                                }}
                                whileHover={{ y: -5 }}
                                className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:border-primary/20 cursor-pointer group flex flex-col items-start transition-all duration-300"
                                onClick={() => router.push(`/public/services/${group.slug}`)}
                            >
                                <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-8 group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                    <Icon size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">{group.name}</h3>

                                {minPrice !== null && (
                                    <div className="mb-4">
                                        <span className="text-sm font-medium text-gray-400">Starting at </span>
                                        <span className="text-lg font-black text-[#f37021]">{formatPrice(minPrice)}</span>
                                    </div>
                                )}

                                <p className="text-gray-500 mb-8 flex-1 leading-relaxed">
                                    {group.description || `View all ${group.name} pricing.`}
                                </p>

                                <div className="w-full flex items-center justify-between mt-auto pt-6 border-t border-gray-100">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        {productCount} Plans Available
                                    </span>
                                    <div className="flex items-center gap-2 text-[#f37021] font-bold text-sm group-hover:gap-3 transition-all duration-300">
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">See Plans</span>
                                        <div className="w-10 h-10 rounded-full bg-[#f37021]/5 flex items-center justify-center group-hover:bg-[#f37021] group-hover:text-white transition-all duration-300">
                                            <ArrowRight size={18} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </motion.div>
        </section>
    );
}
