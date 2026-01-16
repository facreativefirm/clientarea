"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/landing/Footer";
import { useLanguage } from "@/components/language-provider";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCartStore, CartItem } from "@/lib/store/cartStore";
import api from "@/lib/api";
import {
    Loader2,
    CheckCircle2,
    Zap,
    Shield,
    Globe,
    Cpu,
    HardDrive,
    Server,
    ArrowRight,
    ShoppingCart
} from "lucide-react";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { toast } from "sonner";

import { useRouter } from "next/navigation";

export default function ProductDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { t } = useLanguage();
    const router = useRouter();
    const { formatPrice } = useSettingsStore();
    const { addItem } = useCartStore();

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/products`);
                const allProducts = response.data.data.products || [];
                const found = allProducts.find((p: any) => p.id.toString() === id);
                setProduct(found);
            } catch (error) {
                console.error("Failed to fetch product", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        const item: CartItem = {
            id: product.id.toString(),
            name: product.name,
            type: 'HOSTING',
            price: product.monthlyPrice,
            billingCycle: "MONTHLY",
            quantity: 1,
            monthlyPrice: product.monthlyPrice
        };
        addItem(item);
        toast.success(`${product.name} ${t("added_to_cart")}`);
        router.push("/checkout");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <PublicNavbar />
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Profiling System...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-white">
                <PublicNavbar />
                <div className="flex flex-col items-center justify-center py-40 text-center px-6">
                    <h1 className="text-4xl font-black text-gray-900 mb-4">Product Not Found</h1>
                    <p className="text-gray-500 mb-8">The requested asset could not be located in our inventory.</p>
                </div>
                <Footer />
            </div>
        );
    }

    const features = product.description
        ? product.description.split('\n').filter((l: string) => l.trim().length > 0)
        : ["24/7 Expert Support", "BDIX Optimized Network", "LiteSpeed Server Support", "Daily Database Backups", "Imunify360 Security"];

    return (
        <div className="min-h-screen bg-white font-sans">
            <PublicNavbar />

            <main className="pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                        {/* Info Column */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-10"
                        >
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                                    <Zap size={14} />
                                    High Performance
                                </div>
                                <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight leading-none">
                                    {product.name}
                                </h1>
                                <p className="text-xl text-gray-500 leading-relaxed max-w-xl">
                                    {product.description?.split('\n')[0] || `Enterprise-grade infrastructure solution optimized for high-traffic applications in Bangladesh.`}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: "Storage", value: "NVMe SSD", icon: HardDrive },
                                    { label: "Uptime", value: "99.9% SLA", icon: Shield },
                                    { label: "Network", value: "10 Gbps", icon: Globe },
                                    { label: "Architecture", value: "Isolated", icon: Cpu }
                                ].map((spec, i) => (
                                    <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary border border-gray-100/50">
                                            <spec.icon size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{spec.label}</p>
                                            <p className="text-sm font-black text-gray-900">{spec.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-900 uppercase text-xs tracking-[0.2em]">Included Features</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                                    {features.map((feature: string, i: number) => (
                                        <div key={i} className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                                            <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Order Column */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="relative"
                        >
                            <div className="sticky top-32">
                                <div className="bg-gray-900 rounded-[3rem] p-10 md:p-12 text-white shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <Server size={200} />
                                    </div>

                                    <div className="relative z-10 space-y-10">
                                        <div>
                                            <p className="text-primary font-black uppercase text-[10px] tracking-widest mb-4">Investment Summary</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-6xl font-black">{formatPrice(product.monthlyPrice)}</span>
                                                <span className="text-gray-400 font-bold">/mo</span>
                                            </div>
                                            <p className="text-gray-500 text-xs mt-4 font-medium uppercase tracking-widest">Billed Monthly • Scale Anytime</p>
                                        </div>

                                        <div className="space-y-4">
                                            <Button
                                                onClick={handleAddToCart}
                                                className="w-full h-16 rounded-[1.5rem] bg-[#f37021] hover:bg-[#d9621c] text-white font-black text-lg shadow-xl shadow-[#f37021]/20 hover:scale-[1.02] active:scale-100 transition-all gap-3"
                                            >
                                                <ShoppingCart size={22} />
                                                Add to Cluster
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full h-16 rounded-[1.5rem] bg-white/5 border-white/10 text-white font-black text-base hover:bg-white/10 transition-all gap-3"
                                            >
                                                Custom Inquiry
                                                <ArrowRight size={20} className="text-gray-500" />
                                            </Button>
                                        </div>

                                        <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                                            <p className="text-gray-400 text-[11px] leading-relaxed">
                                                By proceeding with the order, you agree to our 30-day money-back guarantee policy. Managed support is included at no additional cost.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
