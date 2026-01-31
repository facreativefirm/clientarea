"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Loader2,
    CheckCircle2,
    Zap,
    Shield,
    Globe,
    Cpu,
    HardDrive,
    Server,
    Database,
    Network,
    Clock,
    ArrowRight,
    ShoppingCart,
    ChevronLeft,
    XCircle
} from "lucide-react";
import { useStore } from "@/components/store/StoreProvider";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cartStore";
import { useSettingsStore } from "@/lib/store/settingsStore";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { getProductDisplayPrice, calculateCartPrice } from "@/lib/productUtils";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function StoreProductDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const router = useRouter();
    const { brand } = useStore();
    const { formatPrice } = useSettingsStore();
    const { addItem } = useCartStore();

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const urlParams = new URLSearchParams(window.location.search);
                const host = urlParams.get('host') || window.location.host;
                const billing = urlParams.get('billing') as 'monthly' | 'annually';
                const sanitizedHost = host.replace(/^https?:\/\//, '').replace(/\/$/, '');

                const response = await api.get(`/products?host=${encodeURIComponent(sanitizedHost)}`);
                const allProducts = response.data.data.products || [];
                const found = allProducts.find((p: any) => p.slug === slug);
                setProduct(found);

                if (billing && (billing === 'monthly' || billing === 'annually')) {
                    setBillingCycle(billing);
                }
            } catch (error) {
                console.error("Failed to fetch product", error);
                toast.error("Could not load product details");
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchProduct();
    }, [slug]);

    const getPrice = () => {
        if (!product) return 0;
        const display = getProductDisplayPrice(product);
        if (billingCycle === 'annually') {
            const annual = Number(product.annualPrice);
            if (annual > 0) return annual / 12;
            const monthly = Number(product.monthlyPrice);
            return monthly > 0 ? monthly : display.price;
        }
        return display.price;
    };

    const handleAddToCart = () => {
        if (!product) return;
        const display = getProductDisplayPrice(product);
        const cycle = billingCycle === 'annually' ? 'ANNUALLY' : 'MONTHLY';
        const price = calculateCartPrice(product, cycle) || display.price;

        addItem({
            id: String(product.id),
            name: product.name,
            price: price,
            quantity: 1,
            billingCycle: cycle as any,
            type: (product.productType === 'DOMAIN' ? 'DOMAIN' : (['HOSTING', 'VPS', 'RESELLER'].includes(product.productType) ? 'HOSTING' : 'OTHER')) as any,
            monthlyPrice: Number(product.monthlyPrice) || (display.billingCycle === 'MONTHLY' ? display.price : 0),
            annualPrice: Number(product.annualPrice) || (display.billingCycle === 'ANNUALLY' ? display.price : 0)
        });
        toast.success(`${product.name} added to cart!`);
        router.push("/store/cart");
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Identifying Asset...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
                <XCircle size={64} className="text-muted-foreground/30 mb-6" />
                <h1 className="text-4xl font-black text-foreground mb-4">Product Not Found</h1>
                <p className="text-muted-foreground mb-8">The requested infrastructure asset could not be located.</p>
                <Link href="/store/products">
                    <Button className="rounded-xl px-8 bg-primary">Back to Catalog</Button>
                </Link>
            </div>
        );
    }

    const getFeatures = () => {
        if (!product.features) return ["High Availability", "99.9% Uptime SLA", "24/7 Technical Support", "Global Network Access", "DDoS Protection"];
        try {
            const parsed = typeof product.features === 'string' ? JSON.parse(product.features) : product.features;
            return Array.isArray(parsed) ? parsed : (parsed.list || []);
        } catch (e) {
            return ["High Availability", "99.9% Uptime SLA", "24/7 Technical Support", "Global Network Access", "DDoS Protection"];
        }
    };

    const features = getFeatures();
    const currentPrice = getPrice();

    const getIconForFeature = (feature: string) => {
        const lower = feature.toLowerCase();
        if (lower.includes('cpu') || lower.includes('core') || lower.includes('vcpu')) return Cpu;
        if (lower.includes('ram') || lower.includes('memory')) return Database;
        if (lower.includes('ssd') || lower.includes('nvme') || lower.includes('disk') || lower.includes('storage')) return HardDrive;
        if (lower.includes('bandwidth') || lower.includes('transfer') || lower.includes('traffic')) return Network;
        return CheckCircle2;
    };

    return (
        <div className="min-h-screen bg-background py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Link href="/store/products" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary mb-12 transition-colors group">
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Products
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
                    {/* Left: Product Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-12"
                    >
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                                <Zap size={14} fill="currentColor" /> Enterprise Infrastructure
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter leading-none uppercase">
                                {product.name}
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl font-medium">
                                {product.description || `Deploy professional, scalable ${product.name} infrastructure today. Optimized for performance and mission-critical reliability.`}
                            </p>
                        </div>

                        {/* Spec Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: "Performance", value: "High-Speed", icon: Zap },
                                { label: "Security", value: "Encrypted", icon: Shield },
                                { label: "Uptime", value: "99.9% SLA", icon: CheckCircle2 },
                                { label: "Access", value: "Global Network", icon: Globe }
                            ].map((spec, i) => (
                                <div key={i} className="p-6 bg-muted/30 rounded-3xl border border-border flex flex-col gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-background border border-border shadow-sm flex items-center justify-center text-primary">
                                        <spec.icon size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1.5">{spec.label}</p>
                                        <p className="text-lg font-bold text-foreground">{spec.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Features List */}
                        <div className="space-y-6">
                            <h3 className="font-black text-foreground uppercase text-xs tracking-[0.3em]">Core Specifications</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-10">
                                {features.map((feature: string, i: number) => {
                                    const Icon = getIconForFeature(feature);
                                    return (
                                        <div key={i} className="flex items-center gap-3 text-base text-muted-foreground font-bold group/feat">
                                            <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-primary/60 group-hover/feat:bg-primary/5 group-hover/feat:text-primary transition-all">
                                                <Icon size={16} />
                                            </div>
                                            {feature}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Order Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative"
                    >
                        <div className="lg:sticky lg:top-32">
                            <div className="bg-card rounded-[3rem] p-10 md:p-12 text-foreground shadow-2xl border border-border relative overflow-hidden">
                                {/* Subtle Background Elements */}
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Server size={200} />
                                </div>
                                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/5 blur-[100px] rounded-full" />

                                <div className="relative z-10 space-y-10">
                                    <div>
                                        {/* Billing Toggle In-Card */}
                                        <div className="flex items-center p-1 bg-muted rounded-xl border border-border w-fit mb-8 scale-90 origin-left">
                                            <button
                                                onClick={() => setBillingCycle('monthly')}
                                                className={cn(
                                                    "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                                    billingCycle === 'monthly' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                                                )}
                                            >
                                                Monthly
                                            </button>
                                            <button
                                                onClick={() => setBillingCycle('annually')}
                                                className={cn(
                                                    "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                                    billingCycle === 'annually' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                                                )}
                                            >
                                                Annually
                                            </button>
                                        </div>

                                        <p className="text-primary font-black uppercase text-[10px] tracking-widest mb-6 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Asset Subscription
                                        </p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-7xl font-black tracking-tighter text-foreground">{formatPrice(currentPrice)}</span>
                                            <span className="text-muted-foreground font-black text-xl">
                                                /{billingCycle === 'annually' ? 'mo' : getProductDisplayPrice(product).cycle}
                                            </span>
                                        </div>
                                        {billingCycle === 'annually' && (
                                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-4 bg-emerald-500/10 px-3 py-1.5 rounded-lg w-fit">
                                                Active Discount Applied • Save Over {formatPrice(Number(product.monthlyPrice) * 1.2)}/yr
                                            </p>
                                        )}
                                        <p className="text-muted-foreground text-[10px] mt-8 font-black uppercase tracking-[0.2em] opacity-50">Auto-Provisioning Protocol Enabled</p>
                                    </div>

                                    <div className="space-y-4 pt-6 border-t border-border">
                                        <Button
                                            onClick={handleAddToCart}
                                            className="w-full h-20 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black text-xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-100 transition-all gap-4 border-none py-8 flex items-center justify-center group/btn"
                                        >
                                            Initialize Deployment
                                            <ArrowRight size={24} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        {[
                                            { label: "Instant Access", icon: Zap },
                                            { label: "24/7 Priority Support", icon: Clock },
                                            { label: "Cancel Anytime", icon: CheckCircle2 }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                <item.icon size={14} className="text-primary/60" />
                                                {item.label}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-6 bg-muted/50 rounded-2xl border border-border">
                                        <p className="text-muted-foreground text-[11px] leading-relaxed font-medium">
                                            Deployment includes managed configuration, security patches, and SLA monitoring. Enterprise grid connected.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

import { XCircle as XCircleIcon } from "lucide-react";
