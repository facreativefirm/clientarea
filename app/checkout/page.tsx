"use client";

import React, { useState, useEffect, Suspense } from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/landing/Footer";
import { useLanguage } from "@/components/language-provider";
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

function PublicCheckoutContent() {
    const { t } = useLanguage();
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

    const MANUAL_METHODS = [
        {
            id: 'bkash_manual', name: 'bKash Personal', desc: 'Send Money (Instant)', icon: Smartphone, type: 'manual',
            instructions: {
                en: '1. Go to your bKash Mobile Menu or App.\n2. Choose "Send Money".\n3. Enter: 017XXXXXX (Personal Number).\n4. Amount: Use Total Amount.\n5. Reference: Your Invoice #\n6. Confirm with your PIN.',
                bn: '১. আপনার বিকাশ অ্যাপ বা ডায়াল মেনুতে যান।\n২. "Send Money" অপশনটি বেছে নিন।\n৩. নম্বর দিন: ০১৭XXXXXX (পার্সোনাল)।\n৪. পরিমাণ: উপরে উল্লেখিত মোট টাকা।\n৫. রেফারেন্স: আপনার ইনভয়েস নম্বর ব্যবহার করুন।\n৬. আপনার পিন দিয়ে কনফার্ম করুন।'
            }
        },
        {
            id: 'nagad_manual', name: 'Nagad Merchant', desc: 'Merchant Pay (Zero Charge)', icon: Smartphone, type: 'manual',
            instructions: {
                en: '1. Open Nagad App or Dial *167#.\n2. Select "Payment".\n3. Enter Merchant: 018XXXXXXXX.\n4. Amount: Use Total Amount.\n5. Counter: 1\n6. Reference: Your Invoice #',
                bn: '১. নগদ অ্যাপ খুলুন বা *১৬৭# ডায়াল করুন।\n২. "Payment" অপশনটি বেছে নিন।\n৩. মার্চেন্ট নম্বর: ০১৮XXXXXXXX।\n৪. পরিমাণ: উপরে উল্লেখিত মোট টাকা।\n৫. কাউন্টার: ১\n৬. রেফারেন্স: আপনার ইনভয়েস নম্বর ব্যবহার করুন।'
            }
        },
        {
            id: 'rocket_manual', name: 'Rocket Personal', desc: 'Send Money (1.8% Charge)', icon: Smartphone, type: 'manual',
            instructions: {
                en: '1. Open Rocket App or Dial *322#.\n2. Select "Send Money".\n3. Enter: 019XXXXXXXXX.\n4. Amount: Total + 1.8% Charge.\n5. Reference: Your Invoice #',
                bn: '১. রকেট অ্যাপ খুলুন বা *৩২২# ডায়াল করুন।\n২. "Send Money" অপশনটি বেছে নিন।\n৩. রকেট নম্বর দিন: ০১৯XXXXXXXXX।\n৪. পরিমাণ: মোট টাকা + ১.৮% চার্জ।\n৫. রেফারেন্স: আপনার ইনভয়েস নম্বর ব্যবহার করুন।'
            }
        },
        {
            id: 'bank', name: 'Bank Transfer', desc: 'Direct Deposit', icon: Landmark, type: 'manual',
            instructions: {
                en: 'Bank Name: The City Bank Ltd\nAccount Name: WHMCS Fusion\nAccount Number: 1234567890\nBranch: Main Branch\nRef: Your Invoice #',
                bn: 'ব্যাংকের নাম: দি সিটি ব্যাংক লিঃ\nঅ্যাকাউন্টের নাম: WHMCS Fusion\nঅ্যাকাউন্ট নম্বর: ১২৩৪৫৬৭৮৯০\nশাখা: মেইন ব্রাঞ্চ\nরেফারেন্স: আপনার ইনভয়েস নম্বর ব্যবহার করুন'
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
            router.push("/");
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
            const response = await fetch(`/api/domain/check?domain=${finalName}`);
            const data = await response.json();

            if (data.available === true) {
                updateDomainName(itemId, finalName);
                toast.success(`Domain ${finalName} is available!`);
                setDomainTargetItem(null);
            } else if (data.available === false) {
                toast.error(`Domain ${finalName} is already taken.`);
            } else {
                toast.error(data.error || "Could not verify domain.");
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
            toast.error("Please login to continue");
            router.push(`/auth/login?redirect=/checkout`);
            return;
        }

        const missingDomain = items.find(i => (i.type === 'DOMAIN' || i.type === 'HOSTING') && !i.domainName);
        if (!invoiceId && missingDomain) {
            toast.error(`Please set a domain for ${missingDomain.name}`);
            setStep(1);
            return;
        }

        try {
            setLoading(true);

            if (invoiceId && invoice) {
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

            const response = await api.post("/orders", {
                items: items.map(i => {
                    const orderItem: any = {
                        billingCycle: i.billingCycle,
                        quantity: i.quantity || 1,
                    };
                    if (i.id.startsWith('dom-')) {
                        orderItem.domainName = i.domainName;
                    } else {
                        orderItem.productId = parseInt(i.id);
                        if (i.domainName) orderItem.domainName = i.domainName;
                    }
                    return orderItem;
                }),
                paymentMethod: paymentMethod,
                promoCode: promoCode || undefined
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
            <div className="min-h-screen bg-[#0f1d22]">
                <PublicNavbar />
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-[#1e3a44] opacity-40" />
                    <div className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] bg-[#005eae]/20 blur-[120px] rounded-full" />
                    <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] bg-[#f37021]/10 blur-[100px] rounded-full" />
                </div>
                <main className="relative z-10 pt-44 pb-32 flex flex-col items-center justify-center p-4 text-center min-h-[70vh]">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-10 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-8 shadow-2xl">
                        <ShoppingBag className="w-16 h-16 text-[#f37021]" />
                    </motion.div>
                    <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">Your cart is empty</h2>
                    <p className="text-white/60 mb-10 max-w-xs font-medium">Add some services to your cart to get started.</p>
                    <Link href="/#hosting">
                        <Button className="rounded-full px-12 h-14 font-black shadow-lg shadow-[#f37021]/20 bg-[#f37021] hover:bg-[#d9621c] text-white transition-all scale-105 active:scale-95">
                            Browse Services
                        </Button>
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f1d22] text-white font-sans selection:bg-[#f37021] selection:text-white">
            <PublicNavbar />

            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[#1e3a44] opacity-40" />
                <div className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] bg-[#005eae]/20 blur-[120px] rounded-full" />
                <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] bg-[#f37021]/10 blur-[100px] rounded-full" />
            </div>

            <main className="relative z-10 pt-32 pb-24 px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-10">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-1 w-12 bg-[#f37021] rounded-full" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#f37021]">Secure Checkout</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none text-white">
                                {step === 4 ? "Order Complete" : "Finish Your Order"}
                            </h1>
                            <p className="text-white/60 text-lg font-medium max-w-md">
                                {step === 4 ? "Thank you! Your order is being processed." : "Review your items and choose how to pay below."}
                            </p>
                        </div>

                        {step < 4 && (
                            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 p-2 rounded-2xl">
                                {[1, 2, 3].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => step > s && setStep(s)}
                                        className={cn(
                                            "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                            step === s ? "bg-[#f37021] text-white shadow-xl shadow-[#f37021]/30 scale-105" : step > s ? "text-[#f37021] hover:bg-white/5" : "text-white/40 cursor-default"
                                        )}
                                    >
                                        <div className={cn("w-4 h-4 rounded-full flex items-center justify-center border", step === s ? "bg-white text-[#f37021] border-transparent" : "border-current")}>
                                            {step > s ? <CheckCircle size={10} strokeWidth={4} /> : s}
                                        </div>
                                        <span className="hidden sm:inline">{s === 1 ? "Cart" : s === 2 ? "Account" : "Payment"}</span>
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
                                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden">
                                            <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                                <h3 className="font-black text-xs uppercase tracking-widest flex items-center gap-3">
                                                    <ShoppingBag size={18} className="text-[#f37021]" />
                                                    Your Items ({items.length})
                                                </h3>
                                            </div>
                                            <div className="divide-y divide-white/5">
                                                {items.map((item) => (
                                                    <div key={item.cartId} className="p-6 hover:bg-white/[0.02] transition-all group">
                                                        <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                                                            <div className="flex gap-5">
                                                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#f37021] shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                                                                    {item.type === 'DOMAIN' ? <Globe size={24} /> : <Server size={24} />}
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-3">
                                                                        <h4 className="font-black text-xl text-white tracking-tight leading-none group-hover:text-[#f37021] transition-colors">{item.name}</h4>
                                                                        {/* Billing Switcher */}
                                                                        {(item.monthlyPrice && item.annualPrice) && (
                                                                            <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10">
                                                                                <button
                                                                                    onClick={() => updateItem(item.cartId!, { billingCycle: 'MONTHLY', price: item.monthlyPrice! })}
                                                                                    className={cn(
                                                                                        "px-2 py-0.5 text-[9px] rounded-md font-black uppercase transition-all",
                                                                                        item.billingCycle === 'MONTHLY' ? "bg-[#f37021] text-white" : "text-white/40 hover:text-white"
                                                                                    )}
                                                                                >
                                                                                    Monthly
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => updateItem(item.cartId!, { billingCycle: 'ANNUALLY', price: item.annualPrice! })}
                                                                                    className={cn(
                                                                                        "px-2 py-0.5 text-[9px] rounded-md font-black uppercase transition-all",
                                                                                        item.billingCycle === 'ANNUALLY' ? "bg-[#f37021] text-white" : "text-white/40 hover:text-white"
                                                                                    )}
                                                                                >
                                                                                    Annual
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-2 items-center mt-3">
                                                                        <Badge className="bg-white/10 text-white/80 border-none font-black uppercase tracking-widest text-[9px] px-3 py-1">
                                                                            {item.billingCycle} Price
                                                                        </Badge>
                                                                        {(item.type === 'DOMAIN' || item.type === 'HOSTING') && (
                                                                            item.domainName ? (
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5 shadow-sm">
                                                                                        <CheckCircle2 size={12} /> {item.domainName}
                                                                                    </span>
                                                                                    <button onClick={() => setDomainTargetItem(domainTargetItem === item.cartId ? null : item.cartId!)} className="text-[10px] text-[#f37021] font-black uppercase tracking-widest hover:underline px-2">Change</button>
                                                                                </div>
                                                                            ) : (
                                                                                <span className="text-[10px] text-amber-400 font-black uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 flex items-center gap-1.5 animate-pulse">
                                                                                    <Zap size={12} fill="currentColor" /> Domain Required
                                                                                </span>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right flex flex-col items-end gap-2">
                                                                <p className="font-black text-2xl text-white tracking-tighter">{formatPrice(item.price)}</p>
                                                                <button onClick={() => removeItem(item.cartId!)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all">
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Public Domain Verification UI */}
                                                        <AnimatePresence>
                                                            {(domainTargetItem === item.cartId || ((item.type === 'DOMAIN' || item.type === 'HOSTING') && !item.domainName)) && (
                                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-8 pt-8 border-t border-white/5 overflow-hidden">
                                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#f37021] mb-3 block">Enter Name</Label>
                                                                    <div className="flex flex-col sm:flex-row gap-3">
                                                                        <div className="relative flex-1 group/input">
                                                                            <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-[#f37021] transition-colors" />
                                                                            <Input
                                                                                placeholder="example.com"
                                                                                className="h-12 pl-12 rounded-xl bg-white/5 border-white/10 text-white font-bold focus:ring-[#f37021]/20 focus:border-[#f37021] transition-all placeholder:text-white/40"
                                                                                value={domainInputs[item.cartId!] || ""}
                                                                                onChange={(e) => setDomainInputs(prev => ({ ...prev, [item.cartId!]: e.target.value }))}
                                                                            />
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <Button
                                                                                size="lg"
                                                                                disabled={checkingDomainId === item.cartId}
                                                                                onClick={() => validateAndSetDomain(item.cartId!)}
                                                                                className="rounded-xl px-6 h-12 font-black uppercase tracking-widest text-[10px] bg-[#f37021] hover:bg-[#d9621c] text-white shadow-xl shadow-[#f37021]/20 disabled:opacity-70"
                                                                            >
                                                                                {checkingDomainId === item.cartId ? (
                                                                                    <Loader2 size={16} className="animate-spin" />
                                                                                ) : (
                                                                                    "Check & Set"
                                                                                )}
                                                                            </Button>
                                                                            {item.domainName && !checkingDomainId && (
                                                                                <button className="h-12 rounded-xl px-4 text-white/40 hover:text-white font-black uppercase tracking-widest text-[10px]" onClick={() => setDomainTargetItem(null)}>
                                                                                    Cancel
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row justify-between items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 gap-4 shadow-xl">
                                            <Link href="/#hosting" className="text-white/40 hover:text-[#f37021] font-black uppercase tracking-widest text-[11px] flex items-center gap-2 transition-all group">
                                                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Store
                                            </Link>
                                            <Button onClick={() => setStep(isAuthenticated ? 3 : 2)} className="w-full sm:w-auto rounded-full px-12 h-14 font-black uppercase tracking-widest text-xs bg-[#f37021] hover:bg-[#d9621c] text-white shadow-2xl shadow-[#f37021]/30 transition-all scale-105 active:scale-95 flex items-center gap-3">
                                                Next Step <ArrowRight size={18} />
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div key="step2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                                        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-12 shadow-2xl text-center relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#f37021]/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                                            <div className="relative z-10">
                                                <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-[#f37021] shadow-2xl rotate-3 group hover:rotate-0 transition-transform duration-500">
                                                    <Lock size={40} />
                                                </div>
                                                <h3 className="text-3xl font-black text-white tracking-tighter mb-4 uppercase">Log In or Register</h3>
                                                <p className="text-white/60 mb-12 max-w-sm mx-auto font-medium leading-relaxed">You need an account to complete your order. Log in or create one in seconds.</p>

                                                <div className="flex flex-col sm:flex-row gap-5 justify-center">
                                                    <Link href={`/auth/login?redirect=/checkout`} className="flex-1">
                                                        <Button variant="outline" className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-[11px] border-white/10 hover:border-[#f37021] hover:bg-[#f37021]/5 text-white transition-all">Sign In</Button>
                                                    </Link>
                                                    <Link href={`/auth/register?redirect=/checkout`} className="flex-1">
                                                        <Button className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-[11px] bg-white text-[#0f1d22] hover:bg-white/90 shadow-2xl transition-all">Register</Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => setStep(1)} className="text-white/40 hover:text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-2 mx-auto sm:mx-0 transition-all">
                                            <ArrowLeft size={16} /> Edit My Cart
                                        </button>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
                                            <div className="flex items-center gap-3 mb-10">
                                                <div className="w-10 h-10 rounded-xl bg-[#f37021]/20 flex items-center justify-center text-[#f37021] border border-[#f37021]/30">
                                                    <CreditCard size={20} />
                                                </div>
                                                <h3 className="text-sm font-black uppercase tracking-widest text-white">Payment Method</h3>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {[
                                                    { id: 'card', name: 'Credit/Debit Card', desc: 'Secure & Instant', icon: CreditCard },
                                                    ...MANUAL_METHODS.slice(0, 1).map(m => ({ ...m, icon: Smartphone }))
                                                ].map((method) => (
                                                    <button
                                                        key={method.id}
                                                        onClick={() => setPaymentMethod(method.id)}
                                                        className={cn(
                                                            "p-6 rounded-[2rem] border-2 text-left transition-all group relative overflow-hidden",
                                                            paymentMethod === method.id
                                                                ? "border-[#f37021] bg-[#f37021]/5 shadow-lg shadow-[#f37021]/10"
                                                                : "border-white/5 bg-white/[0.02] hover:border-white/20"
                                                        )}
                                                    >
                                                        {paymentMethod === method.id && (
                                                            <div className="absolute top-0 right-0 p-4">
                                                                <CheckCircle2 size={24} className="text-[#f37021] drop-shadow-lg" />
                                                            </div>
                                                        )}
                                                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110", paymentMethod === method.id ? "bg-[#f37021] text-white" : "bg-white/5 text-white/40")}>
                                                            <method.icon size={28} />
                                                        </div>
                                                        <p className="font-black text-xl text-white tracking-tight uppercase leading-none mb-1">{method.name}</p>
                                                        <p className="text-[10px] text-white/50 font-black tracking-widest uppercase">{method.desc}</p>
                                                    </button>
                                                ))}
                                            </div>

                                            <AnimatePresence>
                                                {MANUAL_METHODS.find(m => m.id === paymentMethod) && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-8 p-6 rounded-[1.5rem] bg-white/[0.03] border border-white/5 space-y-6 overflow-hidden">
                                                        <div>
                                                            <p className="text-[10px] font-black text-[#f37021] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                                <Zap size={14} fill="currentColor" /> How to Pay
                                                            </p>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px] leading-relaxed">
                                                                {(() => {
                                                                    const method = MANUAL_METHODS.find(m => m.id === paymentMethod);
                                                                    if (!method) return null;
                                                                    const refValue = invoice?.invoiceNumber || (invoiceId ? `#${invoiceId}` : 'Your Invoice #');
                                                                    return (
                                                                        <>
                                                                            <div className="bg-white/5 p-4 rounded-xl border border-white/5 whitespace-pre-line text-white/80 font-medium">{method.instructions.en.replace('Your Invoice #', refValue)}</div>
                                                                            <div className="bg-[#f37021]/5 p-4 rounded-xl border border-[#f37021]/10 text-white font-sans whitespace-pre-line leading-loose">{method.instructions.bn.replace('আপনার ইনভয়েস নম্বর ব্যবহার করুন', refValue).replace('আপনার ইনভয়েস নম্বর', refValue)}</div>
                                                                        </>
                                                                    );
                                                                })()}
                                                            </div>
                                                        </div>

                                                        {invoiceId && (
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                                                <div className="space-y-3">
                                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Transaction ID (TrxID)</Label>
                                                                    <Input
                                                                        placeholder="Enter ID here"
                                                                        className="h-12 rounded-xl bg-white/5 border-white/10 text-white font-black uppercase focus:border-[#f37021] placeholder:text-white/40"
                                                                        value={trxId}
                                                                        onChange={(e) => setTrxId(e.target.value)}
                                                                    />
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Your Account Number</Label>
                                                                    <Input
                                                                        placeholder="01XXXXXXXXX"
                                                                        className="h-12 rounded-xl bg-white/5 border-white/10 text-white font-black focus:border-[#f37021] placeholder:text-white/40"
                                                                        value={senderNumber}
                                                                        onChange={(e) => setSenderNumber(e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl text-center">
                                            <p className="text-[11px] text-white/30 mb-8 max-w-sm mx-auto font-medium">By clicking complete, you agree to our terms. Your services will activate after payment.</p>
                                            <Button
                                                onClick={handleCompleteOrder}
                                                disabled={loading}
                                                className="w-full h-16 rounded-full font-black text-xl uppercase tracking-tighter bg-[#f37021] hover:bg-[#d9621c] text-white shadow-2xl shadow-[#f37021]/40 transition-all scale-105 active:scale-95 flex items-center justify-center gap-4"
                                            >
                                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                                    <>
                                                        Complete Order <Zap size={20} fill="currentColor" />
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 4 && (
                                    <motion.div key="step4" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-16 text-center shadow-2xl relative overflow-hidden">
                                        <div className="absolute inset-0 bg-emerald-500/[0.03] animate-pulse" />
                                        <div className="relative z-10 flex flex-col items-center">
                                            <div className="w-24 h-24 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-10 text-emerald-400 border border-emerald-500/20 shadow-2xl">
                                                <CheckCircle className="w-12 h-12" />
                                            </div>
                                            <h2 className="text-5xl font-black text-white tracking-tighter mb-4 uppercase leading-none">Order Successful</h2>
                                            <div className="px-6 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
                                                <p className="text-white/80 font-black uppercase tracking-[0.2em] text-xs">Order Number: <span className="text-[#f37021]">#{completedOrder?.orderNumber}</span></p>
                                            </div>
                                            <p className="text-white/50 text-lg mb-12 max-w-sm mx-auto font-medium leading-relaxed">We've received your order! You can now manage your account or pay the invoice below.</p>

                                            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
                                                <Link href={`/client/checkout?invoiceId=${completedOrder?.id}`} className="flex-1">
                                                    <Button className="w-full h-14 rounded-full font-black uppercase bg-[#f37021] text-white shadow-xl shadow-[#f37021]/20">Pay Now</Button>
                                                </Link>
                                                <Link href="/client/dashboard" className="flex-1">
                                                    <Button variant="outline" className="w-full h-14 rounded-full font-black uppercase tracking-widest text-[10px] border-white/10 text-white hover:bg-white/5">Client Dashboard</Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Order Summary Sidebar */}
                        {step !== 4 && (
                            <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-6">
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl shadow-[#f37021]/5">
                                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                                        <Receipt size={16} className="text-[#f37021]" /> Summary
                                    </h4>

                                    <div className="space-y-5 pb-8 border-b border-white/5">
                                        <div className="flex justify-between items-center text-sm font-bold">
                                            <span className="text-white/50 font-black uppercase tracking-widest text-[10px]">Subtotal</span>
                                            <span className="text-white text-lg tracking-tighter">{formatPrice(items.reduce((acc, i) => acc + (typeof i.price === 'string' ? parseFloat(i.price) : (i.price || 0)), 0))}</span>
                                        </div>
                                        {promoCode && (
                                            <div className="flex justify-between items-center text-[#f37021] font-black uppercase tracking-[0.2em] text-[10px] bg-[#f37021]/10 p-4 rounded-2xl border border-[#f37021]/20">
                                                <span className="flex items-center gap-2"><Tag size={12} fill="currentColor" /> Active Discount</span>
                                                <span className="text-lg">-20%</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center text-white/50 text-[10px] font-black uppercase tracking-widest">
                                            <span>Tax</span>
                                            <span className="text-sm tracking-tighter text-white/80">{formatPrice(0)}</span>
                                        </div>
                                    </div>

                                    <div className="pt-8 flex flex-col items-end">
                                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">Total Amount</span>
                                        <span className="text-4xl font-black text-white tracking-tighter leading-none">
                                            {formatPrice(total())}
                                        </span>
                                        <div className="w-20 h-1 bg-[#f37021] rounded-full mt-4" />
                                    </div>

                                    {!invoiceId && (
                                        <div className="pt-10 space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3 block">Promo Code</Label>
                                            <div className="flex gap-3">
                                                <Input
                                                    placeholder="CODE"
                                                    value={promoInput}
                                                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                                                    className="h-12 rounded-xl bg-white/5 border-white/10 text-white font-black uppercase focus:border-[#f37021] placeholder:text-white/40"
                                                />
                                                <Button size="lg" onClick={handleApplyPromo} className="rounded-xl font-black uppercase tracking-widest text-[10px] bg-white text-[#0f1d22] hover:bg-white/90">Apply</Button>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>

                                <div className="bg-[#f37021]/5 border border-[#f37021]/10 rounded-[1.5rem] p-6 flex gap-4 items-start shadow-inner">
                                    <ShieldCheck className="text-[#f37021] mt-1 shrink-0" size={24} />
                                    <div>
                                        <p className="font-black text-white text-sm uppercase tracking-widest mb-1">Secure Checkout</p>
                                        <p className="text-[10px] leading-relaxed text-white/40 font-medium">
                                            Your payment information is encrypted and processed securely.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function PublicCheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0f1d1f] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#f37021]" />
            </div>
        }>
            <PublicCheckoutContent />
        </Suspense>
    );
}
