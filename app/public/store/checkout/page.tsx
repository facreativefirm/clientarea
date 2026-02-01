"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useStore } from "@/components/store/StoreProvider";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";
import {
    ShoppingBag,
    CreditCard,
    CheckCircle,
    Trash2,
    Tag,
    Loader2,
    ArrowRight,
    ArrowLeft,
    ShieldCheck,
    Lock,
    Smartphone,
    Server,
    Zap,
    Landmark,
    Globe,
    CheckCircle2,
    XCircle,
    Receipt
} from "lucide-react";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/shared/Badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { InlineAuth } from "@/components/auth/InlineAuth";

function StoreCheckoutContent() {
    const { brand, resellerId } = useStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const invoiceId = searchParams.get("invoiceId");

    const { items, removeItem, updateItem, clearCart, total, promoCode, setPromoCode, updateDomainName } = useCartStore();
    const { user, isAuthenticated } = useAuthStore();
    const { formatPrice } = useSettingsStore();

    const [step, setStep] = useState(invoiceId ? 3 : 1);
    const [loading, setLoading] = useState(false);
    const [promoInput, setPromoInput] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("card");
    const [invoice, setInvoice] = useState<any>(null);
    const [trxId, setTrxId] = useState("");
    const [senderNumber, setSenderNumber] = useState("");

    // Domain Search State
    const [domainInputs, setDomainInputs] = useState<Record<string, string>>({});
    const [domainTargetItem, setDomainTargetItem] = useState<string | null>(null);
    const [checkingDomainId, setCheckingDomainId] = useState<string | null>(null);

    const [completedOrder, setCompletedOrder] = useState<any>(null);
    const [agreeToPolicies, setAgreeToPolicies] = useState(false);

    const MANUAL_METHODS = [
        {
            id: 'bkash_manual', name: 'bKash Personal', desc: 'Send Money (Instant)', icon: Smartphone, type: 'manual',
            instructions: {
                en: '1. Go to your bKash Mobile Menu or App.\n2. Choose "Send Money".\n3. Enter: 017XXXXXX (Personal Number).\n4. Amount: Use Total Amount.\n5. Reference: Your Invoice #\n6. Confirm with your PIN.',
                bn: '১. আপনার বিকাশ অ্যাপ বা ডায়াল মেনুতে যান।\n২. "Send Money" অপশনটি বেছে নিন।\n৩. নম্বর দিন: ০১৭XXXXXX (পার্সোনাল)।\n৪. পরিমাণ: উপরে উল্লেখিত মোট টাকা।\n৫. রেফারেন্স: আপনার ইনভয়েস নম্বর ব্যবহার করুন।\n৬. আপনার পিন দিয়ে কনফার্ম করুন।'
            }
        },
        {
            id: 'nagad_manual', name: 'Nagad Merchant', desc: 'Merchant Pay (Zero Charge)', icon: Smartphone, type: 'manual',
            instructions: {
                en: '1. Open Nagad App or Dial *167#.\n2. Select "Payment".\n3. Enter Merchant: Reseller Nagad Number.\n4. Amount: Use Total Amount.\n5. Counter: 1\n6. Reference: Your Invoice #',
                bn: '১. নগদ অ্যাপ খুলুন বা *১৬৭# ডায়াল করুন।\n২. "Payment" অপশনটি বেছে নিন।\n৩. মার্চেন্ট নম্বর: রিসেলার নগদ নম্বর।\n৪. পরিমাণ: উপরে উল্লেখিত মোট টাকা।\n৫. কাউন্টার: ১\n৬. রেফারেন্স: আপনার ইনভয়েস নম্বর ব্যবহার করুন।'
            }
        },
        {
            id: 'bank', name: 'Bank Transfer', desc: 'Direct Deposit', icon: Landmark, type: 'manual',
            instructions: {
                en: 'Bank Name: Reseller Preferred Bank\nAccount Name: Reseller Brand Name\nAccount Number: XXXXXXXXXX\nBranch: Main Branch\nRef: Your Invoice #',
                bn: 'ব্যাংকের নাম: রিসেলারের ব্যাংক\nঅ্যাকাউন্টের নাম: ব্র্যান্ডের নাম\nঅ্যাকাউন্ট নম্বর: XXXXXXXXXX\nশাখা: মেইন ব্রাঞ্চ\nরেফারেন্স: আপনার ইনভয়েস নম্বর ব্যবহার করুন'
            }
        }
    ];

    useEffect(() => {
        if (invoiceId) {
            fetchInvoice(parseInt(invoiceId));
        }
    }, [invoiceId]);

    const fetchInvoice = async (id: number) => {
        try {
            setLoading(true);
            const response = await api.get(`/invoices/${id}`);
            setInvoice(response.data.data.invoice);
        } catch (error) {
            toast.error("Error loading invoice");
            router.push("/store");
        } finally {
            setLoading(false);
        }
    };

    const handleApplyPromo = () => {
        if (promoInput === "SAVE20") {
            setPromoCode("SAVE20");
            toast.success("Promo code applied!");
        } else {
            toast.error("Invalid promo code");
        }
    };

    const validateAndSetDomain = async (itemId: string) => {
        const val = domainInputs[itemId];
        if (!val || val.length <= 3) {
            toast.error("Please enter a valid domain name");
            return;
        }

        setCheckingDomainId(itemId);
        try {
            const finalName = val.includes(".") ? val : `${val}.com`;
            // Note: In a real app, this should check domain availability via a registrar API
            // For now, mirroring the existing check functionality
            const response = await fetch(`/api/domain/check?domain=${finalName}`);
            const data = await response.json();

            if (data?.available === true) {
                updateDomainName(itemId, data.name);
                toast.success(`Domain ${data.name} is available!`);
                setDomainTargetItem(null);
            } else if (data?.available === false) {
                toast.error(`Domain ${data.name} is already taken.`);
            } else {
                toast.error(data?.error || data?.message || "Could not verify domain.");
            }
        } catch (error) {
            console.error("Checkout domain check error:", error);
            toast.error("Network error. Please try again.");
        } finally {
            setCheckingDomainId(null);
        }
    };

    const handleCompleteOrder = async () => {
        if (!isAuthenticated) {
            setStep(2);
            return;
        }

        if (!agreeToPolicies) {
            toast.error("Please agree to our Terms, Privacy, and Refund policies to continue.");
            return;
        }

        const missingDomain = items.find(i => i.type === 'DOMAIN' && !i.domainName);
        if (!invoiceId && missingDomain) {
            toast.error(`Please set a domain for ${missingDomain.name}`);
            setStep(1);
            return;
        }

        try {
            setLoading(true);

            // Reseller Context
            const urlParams = new URLSearchParams(window.location.search);
            const host = urlParams.get('host') || window.location.host;
            const sanitizedHost = host.replace(/^https?:\/\//, '').replace(/\/$/, '');

            if (invoiceId && invoice) {
                // Handling Existing Invoice Payment
                const selectedMethod = MANUAL_METHODS.find(m => m.id === paymentMethod);
                if (selectedMethod) {
                    if (!trxId || !senderNumber) {
                        toast.error("Enter Transaction ID and Phone");
                        setLoading(false);
                        return;
                    }
                    await api.post("/invoices/manual-payment", {
                        invoiceId: invoice.id,
                        gateway: paymentMethod,
                        transactionId: trxId,
                        senderNumber: senderNumber
                    });
                    toast.success("Payment proof sent! We will verify it.");
                    router.push("/client/transactions");
                    return;
                }

                const gateway = paymentMethod === 'mobile' ? 'BKASH' : 'STRIPE';
                await api.post("/invoices/pay", {
                    invoiceId: invoice.id,
                    gateway: gateway
                });
                toast.success("Payment successful!");
                router.push("/client/transactions");
                return;
            }

            // New Order Creation
            const response = await api.post("/orders", {
                items: items.map(i => {
                    const orderItem: any = {
                        billingCycle: i.billingCycle || 'MONTHLY',
                        quantity: i.quantity || 1,
                    };
                    if (i.id.toString().startsWith('dom-') || i.type === 'DOMAIN') {
                        orderItem.domainName = i.domainName;
                        if (!i.id.toString().startsWith('dom-')) {
                            orderItem.productId = parseInt(i.id.toString());
                        }
                    } else {
                        orderItem.productId = parseInt(i.id.toString());
                        if (i.domainName) orderItem.domainName = i.domainName;
                    }
                    return orderItem;
                }),
                paymentMethod: paymentMethod,
                promoCode: promoCode || undefined,
                resellerHost: sanitizedHost // Crucial for reseller attribution
            });

            setCompletedOrder(response.data.data.order);
            toast.success("Order placed successfully!");
            clearCart();
            setStep(4);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Order failed.");
        } finally {
            setLoading(false);
        }
    };

    if (!invoiceId && items.length === 0 && step !== 4) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
                <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mb-8" />
                <h2 className="text-3xl font-bold text-foreground mb-4">Empty Cart</h2>
                <p className="text-muted-foreground mb-10 max-w-xs">You don't have any items to checkout.</p>
                <Link href="/store/products">
                    <Button size="lg" className="rounded-lg px-8 h-11 font-bold bg-primary hover:bg-primary/90 text-white shadow-lg transition-all">
                        Browse Products
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Phase */}
                <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border pb-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-1 w-12 bg-primary rounded-full" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Branded Checkout</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none text-foreground">
                            {step === 4 ? "Order Finalized" : "Complete Purchase"}
                        </h1>
                        <p className="text-muted-foreground text-lg font-medium max-w-md">
                            {step === 4 ? "Thank you! Your infrastructure is being provisioned." : "Review your assets and finalize your deployment."}
                        </p>
                    </div>

                    {step < 4 && (
                        <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-2xl border border-border">
                            {[1, 2, 3].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => step > s && setStep(s)}
                                    className={cn(
                                        "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                        step === s ? "bg-primary text-white shadow-xl shadow-primary/30 scale-105" : step > s ? "text-primary hover:bg-primary/10" : "text-muted-foreground cursor-default"
                                    )}
                                >
                                    <div className={cn("w-4 h-4 rounded-full flex items-center justify-center border", step === s ? "bg-white text-primary border-transparent" : "border-current")}>
                                        {step > s ? <CheckCircle size={10} strokeWidth={4} /> : s}
                                    </div>
                                    <span className="hidden sm:inline">{s === 1 ? "Review" : s === 2 ? "Identity" : "Payment"}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                                    <div className="bg-card rounded-[2rem] shadow-xl border border-border overflow-hidden">
                                        <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
                                            <h3 className="font-black text-xs uppercase tracking-widest flex items-center gap-3">
                                                <ShoppingBag size={18} className="text-primary" />
                                                Selected Products ({items.length})
                                            </h3>
                                        </div>
                                        <div className="divide-y divide-border">
                                            {items.map((item) => (
                                                <div key={item.cartId} className="p-6 hover:bg-muted/10 transition-all group">
                                                    <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                                                        <div className="flex gap-5">
                                                            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                                                                {item.type === 'DOMAIN' ? <Globe size={24} /> : <Server size={24} />}
                                                            </div>
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-3">
                                                                    <h4 className="font-black text-xl text-foreground tracking-tight leading-none truncate max-w-[200px] sm:max-w-none">{item.name}</h4>
                                                                    {/* Billing Switcher */}
                                                                    {(() => {
                                                                        const monthly = Number(item.monthlyPrice || 0);
                                                                        const annual = Number(item.annualPrice || 0);
                                                                        if (monthly > 0 && annual > 0 && monthly !== annual) {
                                                                            return (
                                                                                <div className="flex items-center bg-muted/50 rounded-lg p-0.5 border border-border">
                                                                                    <button
                                                                                        onClick={() => updateItem(item.cartId!, { billingCycle: 'MONTHLY', price: monthly })}
                                                                                        className={cn(
                                                                                            "px-2 py-0.5 text-[9px] rounded-md font-black uppercase transition-all",
                                                                                            item.billingCycle === 'MONTHLY' ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                                                                                        )}
                                                                                    >
                                                                                        Monthly
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => updateItem(item.cartId!, { billingCycle: 'ANNUALLY', price: annual })}
                                                                                        className={cn(
                                                                                            "px-2 py-0.5 text-[9px] rounded-md font-black uppercase transition-all",
                                                                                            item.billingCycle === 'ANNUALLY' ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                                                                                        )}
                                                                                    >
                                                                                        Annual
                                                                                    </button>
                                                                                </div>
                                                                            );
                                                                        }
                                                                        return null;
                                                                    })()}
                                                                </div>
                                                                <div className="flex flex-wrap gap-2 items-center mt-3">
                                                                    <Badge variant="outline" className="border-primary/20 text-primary font-black uppercase tracking-widest text-[9px] px-3 py-1">
                                                                        {item.billingCycle || 'Monthly'}
                                                                    </Badge>
                                                                    {item.type === 'DOMAIN' && (
                                                                        item.domainName ? (
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5 shadow-sm">
                                                                                    <CheckCircle2 size={12} /> {item.domainName}
                                                                                </span>
                                                                                <button onClick={() => setDomainTargetItem(domainTargetItem === item.cartId ? null : item.cartId!)} className="text-[10px] text-primary font-black uppercase tracking-widest hover:underline px-2">Change</button>
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 flex items-center gap-1.5 animate-pulse">
                                                                                <Zap size={12} fill="currentColor" /> Domain Required
                                                                            </span>
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex flex-col items-end gap-2">
                                                            <p className="font-black text-2xl text-foreground tracking-tighter">{formatPrice(Number(item.price) * (item.quantity || 1))}</p>
                                                            {item.setupFee && Number(item.setupFee) > 0 && (
                                                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                                                                    + {formatPrice(item.setupFee)} Setup
                                                                </p>
                                                            )}
                                                            <button onClick={() => removeItem(item.cartId!)} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-destructive flex items-center gap-1">
                                                                <Trash2 size={14} /> Remove
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Domain Config Area */}
                                                    <AnimatePresence>
                                                        {(domainTargetItem === item.cartId || (item.type === 'DOMAIN' && !item.domainName)) && (
                                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-8 pt-8 border-t border-border overflow-hidden">
                                                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 block">Configure Domain</Label>
                                                                <div className="flex flex-col sm:flex-row gap-3">
                                                                    <div className="relative flex-1 group/input">
                                                                        <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                                                                        <Input
                                                                            placeholder="example.com"
                                                                            className="h-12 pl-12 rounded-xl border-border bg-background text-foreground font-bold focus:ring-primary focus:border-primary transition-all shadow-inner"
                                                                            value={domainInputs[item.cartId!] || ""}
                                                                            onChange={(e) => setDomainInputs(prev => ({ ...prev, [item.cartId!]: e.target.value }))}
                                                                        />
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <Button
                                                                            size="lg"
                                                                            disabled={checkingDomainId === item.cartId}
                                                                            onClick={() => validateAndSetDomain(item.cartId!)}
                                                                            className="rounded-xl px-6 h-12 font-black uppercase tracking-widest text-[10px] bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 disabled:opacity-70"
                                                                        >
                                                                            {checkingDomainId === item.cartId ? (
                                                                                <Loader2 size={16} className="animate-spin" />
                                                                            ) : (
                                                                                "Verify & Link"
                                                                            )}
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row justify-between items-center bg-card rounded-[2rem] p-5 gap-4 shadow-lg border border-border">
                                        <Link href="/store/products" className="text-muted-foreground hover:text-primary font-black uppercase tracking-widest text-[11px] flex items-center gap-2 transition-all group">
                                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Store
                                        </Link>
                                        <Button
                                            onClick={() => {
                                                const missingDomain = items.find(i => i.type === 'DOMAIN' && !i.domainName);
                                                if (missingDomain) {
                                                    toast.error(`Please set a domain for ${missingDomain.name}`);
                                                    return;
                                                }
                                                setStep(isAuthenticated ? 3 : 2);
                                            }}
                                            className="w-full sm:w-auto rounded-full px-12 h-14 font-black uppercase tracking-widest text-xs bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 transition-all scale-105 active:scale-95 flex items-center gap-3 border-none"
                                        >
                                            Identity Verification <ArrowRight size={18} />
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                                    <div className="bg-card border border-border rounded-xl p-8 shadow-lg relative overflow-hidden">
                                        <div className="relative z-10 max-w-xl mx-auto">
                                            <InlineAuth onSuccess={() => setStep(3)} />
                                        </div>
                                    </div>
                                    <button onClick={() => setStep(1)} className="text-muted-foreground hover:text-primary font-bold uppercase tracking-wide text-xs flex items-center gap-2 mx-auto sm:mx-0 transition-all">
                                        <ArrowLeft size={16} /> Edit My Deployment
                                    </button>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                    <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                                <CreditCard size={18} />
                                            </div>
                                            <h3 className="text-sm font-bold text-foreground">Funding Protocol</h3>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {MANUAL_METHODS.map((method) => (
                                                <button
                                                    key={method.id}
                                                    onClick={() => setPaymentMethod(method.id)}
                                                    className={cn(
                                                        "p-4 rounded-xl border transition-all group relative overflow-hidden",
                                                        paymentMethod === method.id
                                                            ? "border-primary bg-primary/5"
                                                            : "border-border bg-muted/30 hover:border-primary/50"
                                                    )}
                                                >
                                                    {paymentMethod === method.id && (
                                                        <div className="absolute top-2 right-2">
                                                            <CheckCircle2 size={18} className="text-primary" />
                                                        </div>
                                                    )}
                                                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-all", paymentMethod === method.id ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                                                        <method.icon size={20} />
                                                    </div>
                                                    <p className="font-bold text-sm text-foreground mb-0.5">{method.name}</p>
                                                    <p className="text-[10px] text-muted-foreground">{method.desc}</p>
                                                </button>
                                            ))}
                                        </div>

                                        <AnimatePresence>
                                            {MANUAL_METHODS.find(m => m.id === paymentMethod) && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-8 p-6 rounded-[1.5rem] bg-muted/30 border border-border space-y-6 overflow-hidden shadow-inner">
                                                    <div>
                                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                            <Zap size={14} fill="currentColor" /> Payment Instructions
                                                        </p>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px] leading-relaxed">
                                                            {(() => {
                                                                const method = MANUAL_METHODS.find(m => m.id === paymentMethod);
                                                                if (!method) return null;

                                                                const refValue = invoice?.invoiceNumber || (invoiceId ? `#${invoiceId}` : 'Your Invoice #');
                                                                const enInstructions = method.instructions.en.replace('Your Invoice #', refValue);
                                                                const bnInstructions = method.instructions.bn.replace('আপনার ইনভয়েস নম্বর ব্যবহার করুন', refValue).replace('আপনার ইনভয়েস নম্বর', refValue);

                                                                return (
                                                                    <>
                                                                        <div className="bg-card p-3 rounded-lg border whitespace-pre-line">{enInstructions}</div>
                                                                        <div className="bg-card p-3 rounded-lg border text-primary font-sans whitespace-pre-line">{bnInstructions}</div>
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Transaction ID / TXNID</Label>
                                                            <Input
                                                                placeholder="Enter proof ID"
                                                                className="h-10 rounded-xl font-bold uppercase"
                                                                value={trxId}
                                                                onChange={(e) => setTrxId(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sender Account / Phone</Label>
                                                            <Input
                                                                placeholder="e.g. 017XXXXXXXX"
                                                                className="h-10 rounded-xl"
                                                                value={senderNumber}
                                                                onChange={(e) => setSenderNumber(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="bg-card rounded-xl p-6 shadow-lg border border-border mt-6 space-y-6">
                                        <div className="flex items-start gap-4 text-left bg-muted/30 p-4 rounded-2xl border">
                                            <Checkbox
                                                id="agreeStore"
                                                checked={agreeToPolicies}
                                                onChange={(e: any) => setAgreeToPolicies(e.target.checked)}
                                                className="mt-0"
                                            />
                                            <Label htmlFor="agreeStore" className="text-xs leading-relaxed text-muted-foreground cursor-pointer select-none">
                                                I have read and agree to the{" "}
                                                <Link href="/terms" className="text-primary font-bold hover:underline">Terms & Conditions</Link>,{" "}
                                                <Link href="/privacy" className="text-primary font-bold hover:underline">Privacy Policy</Link>, and{" "}
                                                <Link href="/refund" className="text-primary font-bold hover:underline">Refund Policy</Link>.
                                            </Label>
                                        </div>
                                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                            <button onClick={() => setStep(1)} className="text-muted-foreground hover:text-primary font-bold uppercase tracking-wide text-xs flex items-center gap-2 transition-all">
                                                <ArrowLeft size={16} /> Edit Deployment
                                            </button>
                                            <Button
                                                onClick={handleCompleteOrder}
                                                disabled={loading}
                                                className="w-full sm:w-auto rounded-lg px-8 h-11 font-bold text-sm bg-primary hover:bg-primary/90 text-white shadow-lg flex items-center gap-2"
                                            >
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                                    <>Run Deployment Protocol <Zap size={16} fill="currentColor" /></>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div key="step4" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card border border-border rounded-xl p-10 text-center shadow-2xl relative overflow-hidden">
                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-500 border border-emerald-500/20">
                                            <CheckCircle className="w-10 h-10" />
                                        </div>
                                        <h2 className="text-3xl font-bold text-foreground mb-4">Deployment Active</h2>
                                        <div className="px-4 py-1.5 rounded-full bg-muted/50 border border-border mb-6">
                                            <p className="text-muted-foreground font-medium text-xs">Access Key ID: <span className="text-primary font-bold">#{completedOrder?.orderNumber}</span></p>
                                        </div>
                                        <p className="text-muted-foreground text-base mb-8 max-w-sm mx-auto">Asset provisioning initiated. You can monitor status from your portal.</p>

                                        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
                                            <Link href={`/client/checkout?invoiceId=${completedOrder?.id}`} className="flex-1">
                                                <Button className="w-full h-11 rounded-lg font-bold text-sm bg-primary text-white shadow-lg">Pay Invoice</Button>
                                            </Link>
                                            <Link href="/client" className="flex-1">
                                                <Button variant="outline" className="w-full h-11 rounded-lg font-bold text-sm border-border text-foreground hover:bg-muted/50">Go to Portal</Button>
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Review Sidebar */}
                    {
                        step !== 4 && (
                            <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-6">
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-xl p-6 shadow-lg">
                                    <h4 className="text-xs font-bold text-muted-foreground mb-6 flex items-center gap-2">
                                        <Receipt size={14} className="text-primary" /> Invoice Summary
                                    </h4>

                                    <div className="space-y-3 pb-6 border-b border-border">
                                        <div className="flex justify-between items-center text-sm font-medium">
                                            <span className="text-muted-foreground">Net Value</span>
                                            <span className="text-foreground">
                                                {formatPrice(items.reduce((acc, i) => acc + (Number(i.price) * (i.quantity || 1)), 0))}
                                            </span>
                                        </div>
                                        {promoCode && (
                                            <div className="flex justify-between items-center text-primary text-xs bg-primary/10 p-2 rounded-lg border border-primary/20">
                                                <span className="flex items-center gap-2"><Tag size={12} fill="currentColor" /> Code: {promoCode}</span>
                                                <span className="font-bold">-20%</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center text-muted-foreground text-sm">
                                            <span>Tax</span>
                                            <span className="text-foreground">{formatPrice(0)}</span>
                                        </div>
                                    </div>

                                    <div className="pt-6 flex flex-col items-end">
                                        <span className="text-xs text-muted-foreground mb-1">Total Payable</span>
                                        <span className="text-3xl font-bold text-primary leading-none">
                                            {formatPrice(total())}
                                        </span>
                                    </div>

                                    {!invoiceId && step === 1 && (
                                        <div className="pt-6 space-y-2">
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Promo Code"
                                                    value={promoInput}
                                                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                                                    className="h-10 rounded-lg border-border bg-background text-foreground font-bold text-sm focus:border-primary"
                                                />
                                                <Button onClick={handleApplyPromo} className="h-10 rounded-lg font-bold text-xs bg-foreground text-background hover:opacity-90">Apply</Button>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>

                                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex gap-3 items-start shadow-inner">
                                    <ShieldCheck className="text-primary mt-0.5 shrink-0" size={18} />
                                    <div>
                                        <p className="font-bold text-foreground text-xs mb-0.5">Bank-Grade Security</p>
                                        <p className="text-[10px] leading-relaxed text-muted-foreground">
                                            Global SSL encryption active.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                </div >
            </div >
        </div >
    );
}

export default function StoreCheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-sm font-black text-muted-foreground uppercase tracking-[0.3em]">Syncing Protocol...</p>
            </div>
        }>
            <StoreCheckoutContent />
        </Suspense>
    );
}
