"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    ShoppingBag,
    Trash2,
    ArrowRight,
    ArrowLeft,
    Globe,
    Server,
    Zap,
    Tag,
    ChevronRight,
    Minus,
    Plus,
    Loader2
} from "lucide-react";
import { useStore } from "@/components/store/StoreProvider";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cartStore";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function StoreCartPage() {
    const { brand } = useStore();
    const { items, removeItem, updateItem, total, promoCode, setPromoCode } = useCartStore();
    const { formatPrice } = useSettingsStore();
    const [promoInput, setPromoInput] = useState("");

    const subtotal = items.reduce((acc, item) => {
        const itemPrice = Number(item.price);
        const itemQuantity = item.quantity || 1;
        const multiplier = item.billingCycle.toLowerCase() === 'annually' ? 12 : 1;
        return acc + (itemPrice * multiplier * itemQuantity);
    }, 0);
    const totalAmount = total(); // total() also needs to be cycle aware if it isn't

    const handleApplyPromo = () => {
        if (promoInput.trim() === "SAVE20") {
            setPromoCode("SAVE20");
            toast.success("Promo code applied!");
        } else if (promoInput.trim() === "") {
            toast.error("Please enter a promo code");
        } else {
            toast.error("Invalid promo code");
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-8"
                >
                    <ShoppingBag size={48} />
                </motion.div>
                <h2 className="text-3xl font-bold text-foreground mb-4">Your cart is empty</h2>
                <p className="text-muted-foreground mb-10 max-w-sm">
                    Looks like you haven't added any hosting solutions to your cart yet.
                </p>
                <Link href="/store/products">
                    <Button size="lg" className="rounded-xl px-12 h-14 font-bold bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all">
                        Browse Products
                        <ArrowRight className="ml-2" size={20} />
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-2">
                        <Link href="/store" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Store</Link>
                        <ChevronRight size={14} className="text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Shopping Cart</span>
                    </div>
                    <h1 className="text-4xl font-bold text-foreground">Shopping Cart</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Cart Items */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                            <div className="p-6 border-b border-border bg-muted/30">
                                <h3 className="font-bold text-sm uppercase tracking-widest flex items-center gap-3">
                                    <ShoppingBag size={18} className="text-primary" />
                                    Cart Items ({items.length})
                                </h3>
                            </div>
                            <div className="divide-y divide-border">
                                {items.map((item) => (
                                    <div key={item.cartId} className="p-6 hover:bg-muted/10 transition-all group">
                                        <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                                            <div className="flex gap-5 flex-1">
                                                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                                                    {item.type === 'DOMAIN' ? <Globe size={28} /> : <Server size={28} />}
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">{item.name}</h4>
                                                    <p className="text-sm text-muted-foreground italic">{item.type}</p>

                                                    {/* Billing Cycle Selector */}
                                                    {item.type !== 'DOMAIN' && (
                                                        <div className="flex items-center gap-2 mt-3">
                                                            <select
                                                                value={item.billingCycle.toLowerCase()}
                                                                onChange={(e) => {
                                                                    const cycle = e.target.value;
                                                                    const isAnnual = cycle === 'annually';
                                                                    const price = isAnnual
                                                                        ? (item.annualPrice ? item.annualPrice / 12 : item.monthlyPrice! * 12 * 0.9 / 12)
                                                                        : item.monthlyPrice!;
                                                                    updateItem(item.cartId!, {
                                                                        billingCycle: cycle,
                                                                        price: price
                                                                    });
                                                                }}
                                                                className="text-[10px] font-black uppercase tracking-widest bg-muted border border-border rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-primary transition-all"
                                                            >
                                                                <option value="monthly">Monthly</option>
                                                                <option value="annually">Annually</option>
                                                            </select>
                                                            {item.billingCycle.toLowerCase() === 'annually' && (
                                                                <span className="text-[9px] text-primary font-black uppercase bg-primary/10 px-2 py-0.5 rounded">
                                                                    Save 10%
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                    {item.domainName && (
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                                                                <Zap size={10} fill="currentColor" /> {item.domainName}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto gap-4">
                                                <div className="text-right">
                                                    <p className="font-bold text-2xl text-foreground">
                                                        {item.billingCycle.toLowerCase() === 'annually'
                                                            ? formatPrice(Number(item.price) * 12 * (item.quantity || 1))
                                                            : formatPrice(Number(item.price) * (item.quantity || 1))
                                                        }
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.billingCycle.toLowerCase() === 'annually' ? 'billed annually' : 'per month'}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {/* Quantity Controls - Only if not domain/hosting usually, but we allow it for consistency */}
                                                    <div className="flex items-center bg-muted rounded-xl p-1 border border-border">
                                                        <button
                                                            onClick={() => updateItem(item.cartId!, { quantity: Math.max(1, (item.quantity || 1) - 1) })}
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-background transition-all"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="w-8 text-center font-bold text-sm">{item.quantity || 1}</span>
                                                        <button
                                                            onClick={() => updateItem(item.cartId!, { quantity: (item.quantity || 1) + 1 })}
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-background transition-all"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => removeItem(item.cartId!)}
                                                        className="w-10 h-10 rounded-xl bg-muted/50 border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20 transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Link href="/store/products" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-all group">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Continue Shopping
                        </Link>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
                            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                                <Tag size={20} className="text-primary" />
                                Order Summary
                            </h3>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-bold text-foreground">{formatPrice(subtotal)}</span>
                                </div>

                                {promoCode && (
                                    <div className="flex justify-between items-center text-sm font-medium text-primary bg-primary/5 p-3 rounded-xl border border-primary/10">
                                        <div className="flex items-center gap-2">
                                            <Tag size={14} />
                                            <span>Promo Applied (SAVE20)</span>
                                        </div>
                                        <span>-20%</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Tax</span>
                                    <span className="font-bold text-foreground">{formatPrice(0)}</span>
                                </div>

                                <div className="pt-4 border-t border-border flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Amount</p>
                                        <p className="text-3xl font-black text-primary tracking-tighter">{formatPrice(totalAmount)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Promo Code</label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Enter code"
                                            value={promoInput}
                                            onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                                            className="h-12 rounded-xl border-border bg-background focus:ring-primary focus:border-primary"
                                        />
                                        <Button
                                            variant="outline"
                                            onClick={handleApplyPromo}
                                            className="h-12 rounded-xl px-4 border-border hover:bg-primary/5 hover:text-primary transition-all font-bold"
                                        >
                                            Apply
                                        </Button>
                                    </div>
                                </div>

                                <Link href="/store/checkout" className="block">
                                    <Button className="w-full h-14 rounded-xl font-bold text-lg bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 mt-4">
                                        Checkout Now
                                        <ArrowRight size={20} />
                                    </Button>
                                </Link>

                                <p className="text-[10px] text-center text-muted-foreground font-medium px-4">
                                    By proceeding, you agree to our Terms of Service and Privacy Policy.
                                </p>
                            </div>
                        </div>

                        {/* Feature Badges */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-muted/30 rounded-2xl border border-border text-center">
                                <Zap size={20} className="text-primary mx-auto mb-2" />
                                <p className="text-[10px] font-bold uppercase tracking-widest">Instant Setup</p>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-2xl border border-border text-center">
                                <ShoppingBag size={20} className="text-primary mx-auto mb-2" />
                                <p className="text-[10px] font-bold uppercase tracking-widest">Secure Pay</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
