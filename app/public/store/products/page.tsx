"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
    Server,
    Filter,
    Search,
    Zap,
    Shield,
    Clock,
    CheckCircle2,
    Cpu,
    HardDrive,
    Database,
    Network,
    ArrowRight,
    ShoppingCart,
    ChevronRight,
    Loader2
} from "lucide-react";
import { useStore } from "@/components/store/StoreProvider";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { useCartStore } from "@/lib/store/cartStore";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ProductsPage() {
    const { brand } = useStore();
    const { formatPrice } = useSettingsStore();
    const { addItem } = useCartStore();
    const [products, setProducts] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const host = urlParams.get('host') || window.location.host;
                const category = urlParams.get('category');
                const sanitizedHost = host.replace(/^https?:\/\//, '').replace(/\/$/, '');

                const [servicesRes, productsRes] = await Promise.all([
                    api.get("/products/services"),
                    api.get(`/products?host=${encodeURIComponent(sanitizedHost)}`)
                ]);

                setServices(servicesRes.data.data.services || []);
                setProducts(productsRes.data.data.products || []);

                if (category) {
                    setSelectedCategory(category);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
                toast.error("Failed to load products");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredProducts = products.filter(product => {
        const matchesCategory = !selectedCategory ||
            services.find(s => s.slug === selectedCategory)?.id === product.serviceId;
        const matchesSearch = !searchQuery ||
            product.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const getPrice = (product: any) => {
        const monthly = Number(product.monthlyPrice);
        if (billingCycle === 'annually') {
            // Use annualPrice if available, otherwise apply 10% discount to monthly * 12
            const annualBase = product.annualPrice ? Number(product.annualPrice) : (monthly * 12 * 0.9);
            return annualBase / 12; // Display as per month for annual
        }
        return monthly;
    };

    const handleAddToCart = (product: any) => {
        const monthly = Number(product.monthlyPrice);
        const price = billingCycle === 'annually'
            ? (product.annualPrice ? Number(product.annualPrice) : (monthly * 12 * 0.9))
            : monthly;

        addItem({
            id: String(product.id),
            name: product.name,
            price: price,
            setupFee: product.setupFee ? Number(product.setupFee) : 0,
            quantity: 1,
            billingCycle: billingCycle,
            type: (product.productType === 'DOMAIN' ? 'DOMAIN' : (['HOSTING', 'VPS', 'RESELLER'].includes(product.productType) ? 'HOSTING' : 'OTHER')) as any,
            monthlyPrice: Number(product.monthlyPrice),
            annualPrice: product.annualPrice ? Number(product.annualPrice) : (Number(product.monthlyPrice) * 12 * 0.9)
        });
        toast.success(`${product.name} added to cart!`);
    };

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
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
                            <Zap size={14} fill="currentColor" /> Premium Infrastructure
                        </div>
                        <h1 className="text-5xl font-black text-foreground tracking-tight uppercase leading-none mb-4">
                            Our Products
                        </h1>
                        <p className="text-lg text-muted-foreground font-medium max-w-xl">
                            Deploy high-performance infrastructure tailored for your mission-critical applications.
                        </p>
                    </div>

                    {/* Billing Toggle */}
                    <div className="flex items-center p-1 bg-muted rounded-2xl border border-border w-fit">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all",
                                billingCycle === 'monthly'
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('annually')}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                billingCycle === 'annually'
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Annually
                            <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black">
                                -10%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
                    {/* Search */}
                    <div className="lg:col-span-4 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search infrastructure..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-14 pl-12 pr-4 bg-muted/50 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-sm"
                        />
                    </div>

                    {/* Category Tabs */}
                    <div className="lg:col-span-8 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={cn(
                                "whitespace-nowrap px-6 h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border",
                                !selectedCategory
                                    ? "bg-primary text-white border-primary shadow-xl shadow-primary/20"
                                    : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted"
                            )}
                        >
                            All Assets
                        </button>
                        {services.map((service) => (
                            <button
                                key={service.id}
                                onClick={() => setSelectedCategory(service.slug)}
                                className={cn(
                                    "whitespace-nowrap px-6 h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border",
                                    selectedCategory === service.slug
                                        ? "bg-primary text-white border-primary shadow-xl shadow-primary/20"
                                        : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted"
                                )}
                            >
                                {service.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                        <Loader2 className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="font-black text-xs uppercase tracking-[0.3em] text-muted-foreground">Syncing Catalog...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-32 bg-muted/30 rounded-[3rem] border border-dashed border-border">
                        <Server size={64} className="mx-auto text-muted-foreground/20 mb-6" />
                        <h3 className="text-2xl font-black text-foreground mb-2">No Assets Detected</h3>
                        <p className="text-muted-foreground font-medium">Try adjusting your filtration parameters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProducts.map((product, index) => {
                            const price = getPrice(product);
                            let featureList: string[] = [];
                            try {
                                if (product.features) {
                                    const parsed = typeof product.features === 'string' ? JSON.parse(product.features) : product.features;
                                    featureList = Array.isArray(parsed) ? parsed : (parsed.list || []);
                                }
                            } catch (e) { }

                            return (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group relative flex flex-col bg-card rounded-[2.5rem] p-8 md:p-10 shadow-sm hover:shadow-2xl transition-all border border-border hover:border-primary/20 overflow-hidden"
                                >
                                    {/* Glass reflection */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />

                                    <div className="relative z-10 flex flex-col h-full">
                                        {/* Status Badge */}
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                                <Server size={28} />
                                            </div>
                                            {product.resellerOverride && (
                                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                                                    Special Offer
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-2xl font-black text-foreground mb-3 uppercase tracking-tight group-hover:text-primary transition-colors">
                                            {product.name}
                                        </h3>

                                        <p className="text-sm text-muted-foreground mb-8 font-medium leading-relaxed line-clamp-2">
                                            {product.description || 'Enterprise-grade hosting infrastructure with full management and SLA backing.'}
                                        </p>

                                        {/* Pricing */}
                                        {/* Pricing */}
                                        <div className="mb-10">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-black text-foreground tracking-tighter">
                                                    {formatPrice(billingCycle === 'annually' ? (price) : price)}
                                                </span>
                                                <span className="text-muted-foreground font-bold text-sm tracking-tight">/mo</span>
                                            </div>
                                            {product.setupFee && Number(product.setupFee) > 0 && (
                                                <p className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest mt-1">
                                                    + {formatPrice(product.setupFee)} Setup Fee
                                                </p>
                                            )}
                                            {billingCycle === 'annually' && (
                                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-2">
                                                    Billed annually • Save {formatPrice((Number(product.monthlyPrice) * 12) - (price * 12))}/yr
                                                </p>
                                            )}
                                        </div>

                                        {/* Specs List */}
                                        <div className="space-y-4 mb-10 mt-auto border-t border-border/50 pt-8">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Core Specifications</p>
                                            {(featureList.length > 0 ? featureList : ["High Performance", "99.9% Uptime", "24/7 Support", "DDoS Protection"]).slice(0, 5).map((feature, i) => {
                                                const Icon = getIconForFeature(feature);
                                                return (
                                                    <div key={i} className="flex items-center gap-3 text-sm font-bold text-foreground/80 group/feat">
                                                        <div className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center text-primary/60 group-hover/feat:text-primary group-hover/feat:bg-primary/5 transition-all">
                                                            <Icon size={14} />
                                                        </div>
                                                        {feature}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Actions */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                onClick={() => handleAddToCart(product)}
                                                className="h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 group/btn transition-all"
                                            >
                                                Initialize
                                                <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                            </Button>
                                            <Link href={`/store/products/${product.slug}?billing=${billingCycle}`} className="w-full">
                                                <Button
                                                    variant="outline"
                                                    className="w-full h-14 rounded-2xl border-border hover:bg-muted/50 font-black text-xs uppercase tracking-widest"
                                                >
                                                    Details
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
