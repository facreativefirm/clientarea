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
import { getProductDisplayPrice, calculateCartPrice } from "@/lib/productUtils";
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

    const getAllChildServiceIds = (serviceSlug: string): number[] => {
        const findService = (list: any[]): any => {
            for (const s of list) {
                if (s.slug === serviceSlug) return s;
                if (s.subServices) {
                    const found = findService(s.subServices);
                    if (found) return found;
                }
            }
            return null;
        };

        const service = findService(services);
        if (!service) return [];

        const ids: number[] = [service.id];
        const collectIds = (s: any) => {
            if (s.subServices) {
                s.subServices.forEach((child: any) => {
                    ids.push(child.id);
                    collectIds(child);
                });
            }
        };
        collectIds(service);
        return ids;
    };

    const allFlattenedServices = (() => {
        const flat: any[] = [];
        const flatten = (list: any[]) => {
            list.forEach(s => {
                flat.push(s);
                if (s.subServices) flatten(s.subServices);
            });
        };
        flatten(services);
        return flat;
    })();

    const groupedServices = allFlattenedServices.map(svc => {
        const svcProducts = products.filter(p => p.serviceId === svc.id);
        const filteredP = svcProducts.filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()));

        let isVisible = !selectedCategory;
        if (selectedCategory) {
            const allowedIds = getAllChildServiceIds(selectedCategory);
            isVisible = allowedIds.includes(svc.id);
        }

        return { ...svc, filteredProducts: filteredP, isVisible };
    }).filter(s => s.isVisible && s.filteredProducts.length > 0);

    const getPrice = (product: any) => {
        const display = getProductDisplayPrice(product);
        if (billingCycle === 'annually') {
            // If annually is selected, try to show annual price / 12
            const annual = Number(product.annualPrice);
            if (annual > 0) return annual / 12;

            // If no annual price, show monthly
            const monthly = Number(product.monthlyPrice);
            return monthly > 0 ? monthly : display.price;
        }
        return display.price;
    };

    const handleAddToCart = (product: any) => {
        const display = getProductDisplayPrice(product);
        const cycle = billingCycle === 'annually' ? 'ANNUALLY' : 'MONTHLY';
        const price = calculateCartPrice(product, cycle) || display.price;

        addItem({
            id: String(product.id),
            name: product.name,
            price: price,
            setupFee: product.setupFee ? Number(product.setupFee) : 0,
            quantity: 1,
            billingCycle: cycle as any,
            type: (product.productType === 'DOMAIN' ? 'DOMAIN' : (['HOSTING', 'VPS', 'RESELLER'].includes(product.productType) ? 'HOSTING' : 'OTHER')) as any,
            monthlyPrice: Number(product.monthlyPrice) || (display.billingCycle === 'MONTHLY' ? display.price : 0),
            annualPrice: Number(product.annualPrice) || (display.billingCycle === 'ANNUALLY' ? display.price : 0)
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

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar: Hierarchy */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-card rounded-[2rem] border border-border p-6 shadow-sm overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                <Filter size={80} />
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-6 flex items-center gap-2">
                                <Filter size={14} /> Service Inventory
                            </h3>

                            <nav className="space-y-1">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all group",
                                        !selectedCategory
                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        !selectedCategory ? "bg-white" : "bg-muted-foreground/20 group-hover:bg-primary/40"
                                    )} />
                                    All Assets
                                </button>

                                {(() => {
                                    const hasActiveChild = (svc: any): boolean => {
                                        if (!selectedCategory) return false;
                                        if (svc.subServices) {
                                            for (const child of svc.subServices) {
                                                if (child.slug === selectedCategory || hasActiveChild(child)) return true;
                                            }
                                        }
                                        return false;
                                    };

                                    const renderServiceItems = (cats: any[], depth = 0, parentSlug: string | null = null) => {
                                        return cats.map((service) => {
                                            const isSelected = selectedCategory === service.slug;
                                            const isExpanded = isSelected || hasActiveChild(service);

                                            return (
                                                <React.Fragment key={service.id}>
                                                    <button
                                                        onClick={() => {
                                                            // Toggle behavior: if already selected, go back to parent (or null)
                                                            if (isSelected) {
                                                                setSelectedCategory(parentSlug);
                                                            } else {
                                                                setSelectedCategory(service.slug);
                                                            }
                                                        }}
                                                        className={cn(
                                                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all group",
                                                            isSelected
                                                                ? "bg-primary text-white shadow-md"
                                                                : isExpanded ? "bg-primary/5 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                        )}
                                                        style={{ paddingLeft: `${(depth * 16) + 16}px` }}
                                                    >
                                                        <div className={cn(
                                                            "w-1.5 h-1.5 rounded-full",
                                                            isSelected ? "bg-white" : isExpanded ? "bg-primary" : "bg-muted-foreground/20 group-hover:bg-primary/40"
                                                        )} />
                                                        {service.name}
                                                    </button>
                                                    {/* Show children if this parent IS SELECTED OR HAS AN ACTIVE CHILD */}
                                                    {service.subServices && service.subServices.length > 0 && isExpanded && renderServiceItems(service.subServices, depth + 1, service.slug)}
                                                </React.Fragment>
                                            );
                                        });
                                    };
                                    return renderServiceItems(services);
                                })()}
                            </nav>
                        </div>

                        {/* Search in Sidebar for Desktop */}
                        <div className="hidden lg:block relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Quick search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-14 pl-12 pr-4 bg-muted/50 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-sm"
                            />
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-9 space-y-8">
                        {/* Mobile Search */}
                        <div className="lg:hidden relative group mb-2">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search infrastructure..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-14 pl-12 pr-4 bg-muted/50 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-sm"
                            />
                        </div>

                        {/* Products Grid */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32 gap-6">
                                <Loader2 className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                <p className="font-black text-xs uppercase tracking-[0.3em] text-muted-foreground">Syncing Catalog...</p>
                            </div>
                        ) : groupedServices.length === 0 ? (
                            <div className="text-center py-32 bg-muted/30 rounded-[3rem] border border-dashed border-border">
                                <Server size={64} className="mx-auto text-muted-foreground/20 mb-6" />
                                <h3 className="text-2xl font-black text-foreground mb-2">No Assets Detected</h3>
                                <p className="text-muted-foreground font-medium">Try selecting a different service group.</p>
                            </div>
                        ) : (
                            <div className="space-y-16">
                                {groupedServices.map((group) => (
                                    <div key={group.id} className="space-y-8">
                                        <div className="flex flex-col gap-1 border-l-4 border-primary pl-5">
                                            <h2 className="text-xl font-black tracking-tight text-foreground uppercase">{group.name}</h2>
                                            {group.description && <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-80">{group.description}</p>}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {group.filteredProducts.map((product: any, index: number) => {
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
                                                        <div className="relative z-10 flex flex-col h-full">
                                                            <div className="flex justify-between items-start mb-8">
                                                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                                                    <Server size={28} />
                                                                </div>
                                                            </div>

                                                            <h3 className="text-2xl font-black text-foreground mb-3 uppercase tracking-tight group-hover:text-primary transition-colors">
                                                                {product.name}
                                                            </h3>

                                                            <p className="text-sm text-muted-foreground mb-8 font-medium leading-relaxed line-clamp-2">
                                                                {product.description || 'Enterprise-grade hosting infrastructure.'}
                                                            </p>

                                                            <div className="mb-10">
                                                                <div className="flex items-baseline gap-1">
                                                                    <span className="text-4xl font-black text-foreground tracking-tighter">
                                                                        {formatPrice(price)}
                                                                    </span>
                                                                    <span className="text-muted-foreground font-bold text-sm tracking-tight">
                                                                        /{billingCycle === 'annually' ? 'mo' : getProductDisplayPrice(product).cycle}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-4 mb-10 mt-auto border-t border-border/50 pt-8">
                                                                {(featureList.length > 0 ? featureList : ["High Performance", "99.9% Uptime", "24/7 Support"]).slice(0, 3).map((feature, i) => (
                                                                    <div key={i} className="flex items-center gap-3 text-sm font-bold text-foreground/80">
                                                                        <CheckCircle2 size={14} className="text-primary" />
                                                                        {feature}
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-3">
                                                                <Button
                                                                    onClick={() => handleAddToCart(product)}
                                                                    className="h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 group/btn transition-all"
                                                                >
                                                                    Order Now
                                                                </Button>
                                                                <Link href={`/store/products/${product.slug}`} className="w-full">
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
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
