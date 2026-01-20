"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { useLanguage } from "@/components/language-provider";
import { useCartStore, CartItem } from "@/lib/store/cartStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function HeroSection() {
    const { t } = useLanguage();
    const router = useRouter();
    const { addItem } = useCartStore();
    const [domain, setDomain] = useState("");
    const [tlds, setTlds] = useState<any[]>([]);
    const { formatPrice } = useSettingsStore();

    useEffect(() => {
        const fetchTLDs = async () => {
            try {
                const response = await api.get("/domains/tlds");
                if (response.data?.data?.tlds) {
                    setTlds(response.data.data.tlds.slice(0, 4));
                }
            } catch (e) {
                console.error("Failed to fetch TLDs for hero", e);
            }
        };
        fetchTLDs();
    }, []);

    const [checking, setChecking] = useState(false);
    const [result, setResult] = useState<{ name: string; available: boolean; price?: number } | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!domain) return;

        setChecking(true);
        setResult(null);

        try {
            const domainToSearch = domain.includes(".") ? domain : `${domain}.com`;
            const response = await fetch(`/api/domain/check?domain=${domainToSearch}`);
            const data = await response.json();

            if (data.available !== null) {
                setResult({
                    name: domainToSearch,
                    available: data.available,
                    price: 1750 // Matches the display price for .com
                });
            }
        } catch (error) {
            console.error("Hero domain check failed", error);
            window.location.href = `/client/domains/register?query=${domain}`;
        } finally {
            setChecking(false);
        }
    };

    return (
        <section className="relative pt-40 lg:pt-52 pb-32 overflow-hidden bg-[#0f1d22] min-h-[800px] lg:min-h-[900px] flex items-center">

            {/* --- BACKGROUND LAYERS --- */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[#1e3a44] opacity-40" />
                <div className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] bg-[#005eae]/20 blur-[120px] rounded-full" />
                <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] bg-[#f37021]/10 blur-[100px] rounded-full" />
            </div>

            <div
                className="absolute inset-0 z-0 opacity-[0.12] pointer-events-none"
                style={{
                    maskImage: 'radial-gradient(circle at center, black, transparent 85%)',
                    WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 85%)'
                }}
            >
                <div className="absolute inset-0" style={{
                    backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), 
                                      linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }} />
            </div>

            {/* --- ILLUSTRATION --- */}
            <motion.div
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute top-1/2 -right-10 lg:-right-20 xl:-right-32 -translate-y-1/2 w-[65%] lg:w-[65%] xl:w-[80%] pointer-events-none z-0 hidden lg:block select-none"
            >
                <motion.div
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="relative w-full flex justify-end"
                >
                    <img
                        src="/hero_section.svg"
                        alt="Hosting Illustration"
                        className="w-[90%] h-auto drop-shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                    />
                </motion.div>
            </motion.div>

            {/* --- CONTENT --- */}
            <div className="container relative z-10 px-6 mx-auto">
                <div className="max-w-4xl">
                    <div className="space-y-8 lg:space-y-12">

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                            className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold text-white tracking-tight leading-[1.05]"
                        >
                            {t("hero_title_1")} <br />
                            <span className="text-white">{t("hero_title_accent")}</span>
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="relative pl-8"
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-secondary rounded-full" />
                            <div className="space-y-4">
                                <p className="text-xl text-white/90 leading-relaxed font-normal max-w-2xl">
                                    {t("retention_reputation")}
                                </p>
                                <p className="text-lg font-medium text-secondary cursor-pointer hover:text-secondary/80 transition-all">
                                    {t("verify_buy")}
                                </p>
                            </div>
                        </motion.div>

                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className="max-w-2xl bg-white rounded-full p-1.5 shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex items-center overflow-hidden"
                            >
                                <form onSubmit={handleSearch} className="flex flex-1 items-center">
                                    <input
                                        type="text"
                                        value={domain}
                                        onChange={(e) => setDomain(e.target.value)}
                                        placeholder="Find your perfect domain name"
                                        className="flex-1 bg-transparent border-none text-lg px-6 py-3 text-gray-700 focus:outline-none placeholder:text-gray-400 font-medium"
                                    />
                                    <button
                                        type="submit"
                                        disabled={checking}
                                        className="bg-secondary text-white rounded-full px-10 h-14 font-bold hover:bg-secondary/90 transition-colors shadow-lg shadow-secondary/20 flex items-center gap-2 disabled:opacity-70"
                                    >
                                        {checking && <Loader2 size={20} className="animate-spin" />}
                                        {checking ? "Scanning..." : "Search"}
                                    </button>
                                </form>
                            </motion.div>

                            <AnimatePresence>
                                {result && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="max-w-2xl"
                                    >
                                        <div className={`p-5 rounded-3xl border-2 flex items-center justify-between shadow-xl backdrop-blur-md ${result.available
                                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                            : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                            }`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-full ${result.available ? "bg-emerald-500/20" : "bg-rose-500/20"}`}>
                                                    {result.available ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                                                </div>
                                                <div>
                                                    <p className="text-lg font-bold text-white">{result.name}</p>
                                                    <p className="text-xs font-medium uppercase tracking-wider opacity-80">
                                                        {result.available ? `Available to secure - ${formatPrice(result.price || 0)}` : "This domain is taken"}
                                                    </p>
                                                </div>
                                            </div>
                                            {result.available && (
                                                <Button
                                                    onClick={() => {
                                                        const item: CartItem = {
                                                            id: `dom-${Date.now()}`,
                                                            name: `Domain: ${result.name}`,
                                                            domainName: result.name,
                                                            type: "DOMAIN",
                                                            price: result.price || 1750,
                                                            billingCycle: "YEARLY",
                                                            quantity: 1,
                                                            monthlyPrice: result.price || 1750,
                                                            annualPrice: result.price || 1750
                                                        };
                                                        addItem(item);
                                                        toast.success(`${result.name} added to cart!`);
                                                        router.push("/checkout");
                                                    }}
                                                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold px-6 border-none"
                                                >
                                                    Register Now
                                                </Button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex flex-wrap gap-8 pl-4">
                            {tlds.length > 0 ? (
                                tlds.map((tld, i) => (
                                    <motion.div
                                        key={tld.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.7 + i * 0.1 }}
                                        className="flex items-baseline gap-2 group cursor-default"
                                    >
                                        <span className="text-xl font-bold text-secondary">
                                            {tld.tld.startsWith('.') ? tld.tld : `.${tld.tld}`}
                                        </span>
                                        <span className="text-xl font-bold text-white/90">
                                            {formatPrice(tld.registrationPrice)}
                                        </span>
                                    </motion.div>
                                ))
                            ) : (
                                [
                                    { tld: ".com", price: "Tk1750" },
                                    { tld: ".net", price: "Tk1750" },
                                    { tld: ".org", price: "Tk1790" },
                                    { tld: ".bd", price: "Tk3450" },
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.7 + i * 0.1 }}
                                        className="flex items-baseline gap-2"
                                    >
                                        <span className="text-xl font-bold text-secondary">{item.tld}</span>
                                        <span className="text-xl font-bold text-white/90">{item.price}</span>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0f1d22] to-transparent pointer-events-none" />
        </section>
    );
}