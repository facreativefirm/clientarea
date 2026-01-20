"use client";

import React, { useState, useEffect } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useLanguage } from "@/components/language-provider";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/ui/button";
import {
    ShoppingCart,
    Search,
    Filter,
    RefreshCw,
    Loader2,
    Settings2,
    Database,
    Tag,
    TrendingUp,
    Check,
    X,
    ChevronRight,
    ArrowUpRight
} from "lucide-react";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { cn, formatPrice } from "@/lib/utils";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";

export default function ResellerProductsPage() {
    const { t } = useLanguage();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isOverrideOpen, setIsOverrideOpen] = useState(false);

    // Override Form State
    const [customPrice, setCustomPrice] = useState("");
    const [markupPercent, setMarkupPercent] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get("/reseller/products");
            setProducts(response.data.data.products || []);
        } catch (err) {
            console.error("Error fetching products:", err);
            toast.error("Failed to load product catalog.");
        } finally {
            setLoading(false);
        }
    };

    const { settings } = useSettingsStore();
    const defaultCurrency = settings.defaultCurrency || 'BDT';

    const handleOpenOverride = (product: any) => {
        const override = product.resellerProducts?.[0];
        setSelectedProduct(product);
        setCustomPrice(override?.customPrice?.toString() || "");
        setMarkupPercent(override?.markupPercentage?.toString() || "");
        setIsOverrideOpen(true);
    };

    const handleSaveOverride = async () => {
        try {
            setIsSaving(true);
            await api.patch("/reseller/products/override", {
                productId: selectedProduct.id,
                customPrice: customPrice ? parseFloat(customPrice) : null,
                markupPercent: markupPercent ? parseFloat(markupPercent) : null
            });
            toast.success(`${selectedProduct.name} pricing logic updated.`);
            setIsOverrideOpen(false);
            fetchProducts();
        } catch (err) {
            toast.error("Failed to update pricing override.");
        } finally {
            setIsSaving(false);
        }
    };

    const columns = [
        {
            header: "Product / ID",
            accessorKey: "name" as any,
            cell: (item: any) => (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <Database size={16} />
                    </div>
                    <div>
                        <p className="font-black text-foreground">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                            {item.productType} • ID: {item.id}
                        </p>
                    </div>
                </div>
            )
        },
        {
            header: "Base Price",
            accessorKey: "price" as any,
            cell: (item: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-muted-foreground line-through opacity-50">{formatPrice(Number(item.price), defaultCurrency)}</span>
                    <span className="font-black text-primary text-sm">Wholesale Rate</span>
                </div>
            )
        },
        {
            header: "Your Listing",
            accessorKey: "id" as any,
            cell: (item: any) => {
                const override = item.resellerProducts?.[0];
                let finalPrice = Number(item.price);

                if (override?.customPrice) {
                    finalPrice = Number(override.customPrice);
                } else if (override?.markupPercentage) {
                    finalPrice = Number(item.price) * (1 + Number(override.markupPercentage) / 100);
                }

                return (
                    <div className="flex flex-col">
                        <span className="font-black text-emerald-500 text-lg">{formatPrice(finalPrice, defaultCurrency)}</span>
                        {override ? (
                            <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] w-fit px-2 py-0">Custom Logic</Badge>
                        ) : (
                            <span className="text-[10px] text-muted-foreground font-bold uppercase">Standard Margin</span>
                        )}
                    </div>
                );
            }
        },
        {
            header: "Status",
            accessorKey: "status" as any,
            cell: (item: any) => (
                <Badge variant={item.status === 'ACTIVE' ? 'success' : 'destructive'} className="px-2 py-0.5 rounded-md font-black text-[10px] tracking-widest">
                    {item.status}
                </Badge>
            )
        },
        {
            header: "Operations",
            accessorKey: "id" as any,
            cell: (item: any) => (
                <Button
                    onClick={() => handleOpenOverride(item)}
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 rounded-xl font-black text-[10px] tracking-widest uppercase bg-white/5 border-white/10 hover:bg-primary hover:text-white transition-all gap-2"
                >
                    Update Margin
                    <Settings2 size={12} />
                </Button>
            )
        }
    ];

    return (
        <AuthGuard allowedRoles={["RESELLER"]}>
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
                <Navbar />
                <Sidebar />
                <main className="lg:pl-75 pt-20 p-4 md:p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                                    Product <span className="text-secondary">Arsenal</span>
                                </h1>
                                <p className="text-muted-foreground mt-1 text-sm md:text-base font-medium">Configure profit margins and availability for infrastructure products.</p>
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                        <TrendingUp size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Est. Channel Margin</p>
                                        <p className="text-xl font-black">15.0%</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Inventory Controls */}
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Filter by product name..."
                                    className="pl-12 h-12 rounded-2xl bg-card/50 border-border/50 focus:border-primary/50 transition-all font-bold text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <Button variant="outline" className="h-12 rounded-xl bg-secondary/30 border-border font-bold gap-2">
                                    <Filter size={18} /> Category
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-12 w-12 rounded-xl bg-secondary/30 border-border hover:bg-secondary/50"
                                    onClick={fetchProducts}
                                >
                                    <RefreshCw className={cn("w-5 h-5 text-muted-foreground", loading && "animate-spin")} />
                                </Button>
                            </div>
                        </div>

                        {/* Main Grid */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card border border-border rounded-2xl overflow-hidden p-6 md:p-8 shadow-sm"
                        >
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                                    <p className="text-muted-foreground font-black uppercase text-xs tracking-widest animate-pulse">Syncing Master Node...</p>
                                </div>
                            ) : (
                                <DataTable columns={columns} data={products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))} />
                            )}
                        </motion.div>
                    </div>
                </main>

                {/* Override Modal */}
                <Dialog open={isOverrideOpen} onOpenChange={setIsOverrideOpen}>
                    <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-8 border-white/5 glass shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Tag size={20} />
                                </div>
                                Pricing Protocol
                            </DialogTitle>
                            <DialogDescription className="font-medium text-muted-foreground">
                                Override the wholesale price for <span className="text-foreground font-bold">{selectedProduct?.name}</span>.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-secondary/30 border border-border">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Wholesale Cost</p>
                                    <p className="text-lg font-black">{selectedProduct && formatPrice(Number(selectedProduct.price), defaultCurrency)}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Market Segment</p>
                                    <p className="text-lg font-black capitalize">{selectedProduct?.productType}</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-border">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Profit Percentage (%)</label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            placeholder="e.g. 25"
                                            className="h-14 rounded-2xl bg-secondary/20 border-border font-bold pr-12"
                                            value={markupPercent}
                                            onChange={(e) => {
                                                setMarkupPercent(e.target.value);
                                                setCustomPrice(""); // Clear custom price when using markup
                                            }}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground">%</div>
                                    </div>
                                </div>

                                <div className="relative py-4 flex items-center justify-center">
                                    <div className="absolute inset-x-0 h-[1px] bg-border" />
                                    <span className="relative bg-background px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Or Set Flat Rate</span>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Fixed Selling Price ($)</label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            placeholder="e.g. 99.00"
                                            className="h-14 rounded-2xl bg-secondary/20 border-border font-bold pl-10"
                                            value={customPrice}
                                            onChange={(e) => {
                                                setCustomPrice(e.target.value);
                                                setMarkupPercent(""); // Clear markup when using custom price
                                            }}
                                        />
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground">$</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="sm:justify-between gap-4 mt-4">
                            <Button
                                variant="ghost"
                                onClick={() => setIsOverrideOpen(false)}
                                className="h-12 rounded-xl font-bold px-6"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveOverride}
                                disabled={isSaving}
                                className="h-14 rounded-2xl bg-primary text-primary-foreground font-black px-10 shadow-lg shadow-primary/20 gap-2 flex-1"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check size={20} /> Deploy Update</>}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthGuard>
    );
}
