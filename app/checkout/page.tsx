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
import { Checkbox } from "@/components/ui/checkbox";

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
    const [agreeToPolicies, setAgreeToPolicies] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const ALL_PAYMENT_METHODS = [
        {
            id: 'bkash_payment', name: 'bKash Payment', desc: 'Merchant Payment', icon: Smartphone, type: 'manual',
            instructions: {
                en: '1. Go to your bKash Mobile Menu or App.\n2. Choose "Make Payment".\n3. Enter: 01831395555 (Merchant Number).\n4. Amount: Use Total Amount.\n5. Reference: Your Invoice #\n6. Counter: 1\n7. Confirm with your PIN.',
                bn: '১. আপনার বিকাশ অ্যাপ বা ডায়াল মেনুতে যান।\n২. "Make Payment" অপশনটি বেছে নিন।\n৩. মার্চেন্ট নম্বর দিন: ০১৮৩১৩৯৫৫৫৫।\n৪. পরিমাণ: উপরে উল্লেখিত মোট টাকা।\n৫. রেফারেন্স: আপনার ইনভয়েস নম্বর ব্যবহার করুন।\n৬. কাউন্টার: ১\n৭. আপনার পিন দিয়ে কনফার্ম করুন।'
            }
        },
        {
            id: 'nagad_auto', name: 'Nagad Payment', desc: 'Merchant Payment', icon: Zap, type: 'auto'
        },
        {
            id: 'bkash_manual', name: 'bKash Personal', desc: 'Send Money (Personal)', icon: Smartphone, type: 'manual',
            instructions: {
                en: '1. Go to your bKash Mobile Menu or App.\n2. Choose "Send Money".\n3. Enter: 01781 881199 (Personal Number).\n4. Amount: Total Amount + Cashout Charge.\n5. Reference: Your Invoice #\n6. Confirm with your PIN.',
                bn: '১. আপনার বিকাশ অ্যাপ বা ডায়াল মেনুতে যান।\n২. "Send Money" অপশনটি বেছে নিন।\n৩. নম্বর দিন: ০১৭৮১ ৮৮১১৯৯ (পার্সোনাল)।\n৪. পরিমাণ: মোট টাকা + ক্যাশআউট চার্জ।\n৫. রেফারেন্স: আপনার ইনভয়েস নম্বর ব্যবহার করুন।\n৬. আপনার পিন দিয়ে কনফার্ম করুন।'
            }
        },
        {
            id: 'nagad_manual', name: 'Nagad Personal', desc: 'Send Money (Personal)', icon: Smartphone, type: 'manual',
            instructions: {
                en: '1. Open Nagad App or Dial *167#.\n2. Select "Send Money".\n3. Enter: 01781 881199 (Personal Number).\n4. Amount: Total Amount + Cashout Charge.\n5. Reference: Your Invoice #',
                bn: '১. নগদ অ্যাপ খুলুন বা *১৬৭# ডায়াল করুন।\n২. "Send Money" অপশনটি বেছে নিন।\n৩. নম্বর দিন: ০১৭৮১ ৮৮১১৯৯ (পার্সোনাল)।\n৪. পরিমাণ: মোট টাকা + ক্যাশআউট চার্জ।\n৫. রেফারেন্স: আপনার ইনভয়েস নম্বর ব্যবহার করুন।'
            }
        },
        {
            id: 'rocket_manual', name: 'Rocket Personal', desc: 'Send Money (Personal)', icon: Smartphone, type: 'manual',
            instructions: {
                en: '1. Open Rocket App or Dial *322#.\n2. Select "Send Money".\n3. Enter: 01781 881199 (Personal Number).\n4. Amount: Total Amount + Cashout Charge.\n5. Reference: Your Invoice #',
                bn: '১. রকেট অ্যাপ খুলুন বা *৩২২# ডায়াল করুন।\n২. "Send Money" অপশনটি বেছে নিন।\n৩. রকেট নম্বর দিন: ০১৭৮১ ৮৮১১৯৯ (পার্সোনাল)।\n৪. পরিমাণ: মোট টাকা + ক্যাশআউট চার্জ।\n৫. রেফারেন্স: আপনার ইনভয়েস নম্বর ব্যবহার করুন।'
            }
        },
        {
            id: 'bank_brac', name: 'BRAC BANK', desc: 'Direct Deposit', icon: Landmark, type: 'manual',
            instructions: {
                en: 'Bank Name: BRAC BANK\nAccount Name: F. A. CREATIVE FIRM LIMITED\nAccount Number: 2050400590002\nBranch: Agrabad Branch, Chattogram\nRef: Your Invoice #',
                bn: 'ব্যাংকের নাম: ব্র্যাক ব্যাংক\nঅ্যাকাউন্টের নাম: F. A. CREATIVE FIRM LIMITED\nঅ্যাকাউন্ট নম্বর: ২০৫০৪০০৫৯০০০২\nশাখা: আগ্রাবাদ শাখা, চট্টগ্রাম\nরেফারেন্স: আপনার ইনভয়েস নম্বর ব্যবহার করুন'
            }
        },
        {
            id: 'bank_city', name: 'CITY BANK PLC', desc: 'Direct Deposit', icon: Landmark, type: 'manual',
            instructions: {
                en: 'Bank Name: CITY BANK PLC\nAccount Name: F. A. CREATIVE FIRM LIMITED\nAccount Number: 1224295297001\nBranch: Anderkilla Branch, Chattogram\nRef: Your Invoice #',
                bn: 'ব্যাংকের নাম: সিটি ব্যাংক পিএলসি\nঅ্যাকাউন্টের নাম: F. A. CREATIVE FIRM LIMITED\nঅ্যাকাউন্ট নম্বর: ১২২৪২৯৫২৯৭০০১\nশাখা: আন্দরকিল্লা শাখা, চট্টগ্রাম\nরেফারেন্স: আপনার ইনভয়েস নম্বর ব্যবহার করুন'
            }
        },
        {
            id: 'bank_ucb', name: 'UCB', desc: 'Direct Deposit', icon: Landmark, type: 'manual',
            instructions: {
                en: 'Bank Name: UCB\nAccount Name: F. A. CREATIVE FIRM LIMITED\nAccount Number: 0522112000002158\nBranch: Anderkilla Branch, Chattogram\nRef: Your Invoice #',
                bn: 'ব্যাংকের নাম: ইউসিবি\nঅ্যাকাউন্টের নাম: F. A. CREATIVE FIRM LIMITED\nঅ্যাকাউন্ট নম্বর: ০৫২২১১২০০০০০০২১৫৮\nশাখা: আন্দরকিল্লা শাখা, চট্টগ্রাম\nরেফারেন্স: আপনার ইনভয়েস নম্বর ব্যবহার করুন'
            }
        },
        {
            id: 'bank_pubali', name: 'PUBALI BANK PLC', desc: 'Direct Deposit', icon: Landmark, type: 'manual',
            instructions: {
                en: 'Bank Name: PUBALI BANK PLC\nAccount Name: F. A. CREATIVE FIRM LIMITED\nAccount Number: 1502901041810\nBranch: Anderkilla Branch, Chattogram\nRef: Your Invoice #',
                bn: 'ব্যাংকের নাম: পূবালী ব্যাংক পিএলসি\nঅ্যাকাউন্টের নাম: F. A. CREATIVE FIRM LIMITED\nঅ্যাকাউন্ট নম্বর: ১৫০২৯০১০৪১৮১০\nশাখা: আন্দরকিল্লা শাখা, চট্টগ্রাম\nরেফারেন্স: আপনার ইনভয়েস নম্বর ব্যবহার করুন'
            }
        }
    ];

    useEffect(() => {
        setIsMounted(true);
        if (invoiceId) {
            fetchInvoice(parseInt(invoiceId));
            setStep(3);
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
                updateDomainName(itemId, data.name);
                toast.success(`Domain ${data.name} is available!`);
                setDomainTargetItem(null);
            } else if (data.available === false) {
                toast.error(`Domain ${data.name} is already taken.`);
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

            if (invoiceId && invoice) {
                // Automated Nagad
                if (paymentMethod === 'nagad_auto') {
                    const res = await api.post("/payments/nagad/initiate", {
                        invoiceId: invoice.id
                    });
                    if (res.data.status === 'success') {
                        window.location.href = res.data.data.redirectUrl;
                        return;
                    }
                }

                const selectedMethod = ALL_PAYMENT_METHODS.find(m => m.id === paymentMethod);
                if (selectedMethod && selectedMethod.type === 'manual') {
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
                    if (i.id.startsWith('dom-') || i.type === 'DOMAIN') {
                        orderItem.domainName = i.domainName;
                        if (!i.id.startsWith('dom-')) {
                            orderItem.productId = parseInt(i.id);
                        }
                    } else {
                        orderItem.productId = parseInt(i.id);
                        if (i.domainName) orderItem.domainName = i.domainName;
                    }
                    return orderItem;
                }),
                paymentMethod: paymentMethod,
                promoCode: promoCode || undefined
            });

            const order = response.data.data.order;
            setCompletedOrder(order);
            toast.success("Order placed successfully!");
            clearCart();

            // Redirect immediately if Nagad Automated is selected
            if (paymentMethod === 'nagad_auto' && order.invoices?.[0]?.id) {
                try {
                    const initRes = await api.post("/payments/nagad/initiate", {
                        invoiceId: order.invoices[0].id
                    });
                    if (initRes.data.status === 'success') {
                        window.location.href = initRes.data.data.redirectUrl;
                        return;
                    }
                } catch (initErr) {
                    console.error("Critical: Failed to auto-initiate Nagad after order creation", initErr);
                    // Fallback to step 4 if initiation fails
                }
            }

            setStep(4);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Order failed.");
        } finally {
            setLoading(false);
        }
    };

    if (isMounted && !invoiceId && items.length === 0 && step !== 4) {
        return (
            <div className="min-h-screen bg-[#0f1d22]">
                <PublicNavbar />
                <div className="fixed inset-0 z-0 bg-[#0f1d22]" />
                <main className="relative z-10 pt-32 pb-20 flex flex-col items-center justify-center p-4 text-center min-h-[70vh]">
                    <div className="p-8 rounded-full bg-[#162a31] border border-white/5 mb-8 shadow-2xl">
                        <ShoppingBag className="w-12 h-12 text-[#f37021]" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Your cart is empty</h2>
                    <p className="text-white/60 mb-10 max-w-xs font-medium text-sm">Add some services to your cart to get started.</p>
                    <Link href="/#hosting">
                        <Button className="rounded-lg px-8 h-11 font-bold text-sm bg-[#f37021] hover:bg-[#d9621c] text-white shadow-lg transition-all">
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

            <div className="fixed inset-0 z-0 bg-[#0f1d22]" />

            <main className="relative z-10 pt-32 pb-24 px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-10">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-1 w-12 bg-[#f37021] rounded-full" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#f37021]">Secure Checkout</span>
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                                {step === 4 ? "Order Complete" : "Finish Your Order"}
                            </h1>
                            <p className="text-white/60 text-sm font-medium max-w-md">
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
                                        <div className="bg-[#162a31] border border-white/10 rounded-xl shadow-lg overflow-hidden">
                                            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                                <h3 className="font-bold text-sm flex items-center gap-3">
                                                    <ShoppingBag size={18} className="text-[#f37021]" />
                                                    Your Items ({isMounted ? items.length : 0})
                                                </h3>
                                            </div>
                                            <div className="divide-y divide-white/5">
                                                {isMounted && items.map((item) => (
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
                                                                        {(() => {
                                                                            const monthly = Number(item.monthlyPrice || 0);
                                                                            const annual = Number(item.annualPrice || 0);
                                                                            if (monthly > 0 && annual > 0 && monthly !== annual) {
                                                                                return (
                                                                                    <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10">
                                                                                        <button
                                                                                            onClick={() => updateItem(item.cartId!, { billingCycle: 'MONTHLY', price: monthly })}
                                                                                            className={cn(
                                                                                                "px-2 py-0.5 text-[9px] rounded-md font-black uppercase transition-all",
                                                                                                item.billingCycle === 'MONTHLY' ? "bg-[#f37021] text-white" : "text-white/40 hover:text-white"
                                                                                            )}
                                                                                        >
                                                                                            Monthly
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => updateItem(item.cartId!, { billingCycle: 'ANNUALLY', price: annual })}
                                                                                            className={cn(
                                                                                                "px-2 py-0.5 text-[9px] rounded-md font-black uppercase transition-all",
                                                                                                item.billingCycle === 'ANNUALLY' ? "bg-[#f37021] text-white" : "text-white/40 hover:text-white"
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
                                                                        <Badge className="bg-white/10 text-white/80 border-none font-black uppercase tracking-widest text-[9px] px-3 py-1">
                                                                            {item.billingCycle} Price
                                                                        </Badge>
                                                                        {item.type === 'DOMAIN' && (
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
                                                            <div className="text-right flex flex-col items-end gap-1">
                                                                <p className="font-black text-2xl text-white tracking-tighter">{formatPrice(item.price)}</p>
                                                                {item.setupFee && Number(item.setupFee) > 0 && (
                                                                    <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">
                                                                        + {formatPrice(item.setupFee)} {t('setup_fee')}
                                                                    </p>
                                                                )}
                                                                <button onClick={() => removeItem(item.cartId!)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all mt-2">
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Public Domain Verification UI */}
                                                        <AnimatePresence>
                                                            {(domainTargetItem === item.cartId || (item.type === 'DOMAIN' && !item.domainName)) && (
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
                                            <Button
                                                onClick={() => {
                                                    const missingDomain = items.find(i => i.type === 'DOMAIN' && !i.domainName);
                                                    if (missingDomain) {
                                                        toast.error(`Please set a domain for ${missingDomain.name}`);
                                                        return;
                                                    }
                                                    setStep(isAuthenticated ? 3 : 2);
                                                }}
                                                className="w-full sm:w-auto rounded-lg px-8 h-11 font-bold text-sm bg-[#f37021] hover:bg-[#d9621c] text-white shadow-lg transition-all"
                                            >
                                                Next Step <ArrowRight size={16} className="ml-2" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div key="step2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                                        <div className="bg-[#162a31] border border-white/10 rounded-xl p-8 shadow-lg text-center relative overflow-hidden">
                                            <div className="relative z-10">
                                                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#f37021] shadow-lg">
                                                    <Lock size={28} />
                                                </div>
                                                <h3 className="text-2xl font-bold text-white mb-2">Log In or Register</h3>
                                                <p className="text-white/60 mb-8 max-w-sm mx-auto font-medium text-sm">You need an account to complete your order.</p>

                                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                                    <Link href={`/auth/login?redirect=/checkout`} className="flex-1">
                                                        <Button variant="outline" className="w-full h-11 rounded-lg font-bold text-xs border-white/10 hover:border-[#f37021] hover:bg-[#f37021]/5 text-white">Sign In</Button>
                                                    </Link>
                                                    <Link href={`/auth/register?redirect=/checkout`} className="flex-1">
                                                        <Button className="w-full h-11 rounded-lg font-bold text-xs bg-white text-[#0f1d22] hover:bg-white/90">Register</Button>
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
                                        <div className="bg-[#162a31] border border-white/10 rounded-xl p-6 shadow-lg">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-8 h-8 rounded-lg bg-[#f37021]/20 flex items-center justify-center text-[#f37021] border border-[#f37021]/30">
                                                    <CreditCard size={18} />
                                                </div>
                                                <h3 className="text-sm font-bold text-white">Payment Method</h3>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {ALL_PAYMENT_METHODS.map((method) => (
                                                    <button
                                                        key={method.id}
                                                        onClick={() => setPaymentMethod(method.id)}
                                                        className={cn(
                                                            "p-4 rounded-xl border transition-all group relative overflow-hidden text-left",
                                                            paymentMethod === method.id
                                                                ? "border-[#f37021] bg-[#f37021]/10"
                                                                : "border-white/5 bg-white/[0.03] hover:border-white/20"
                                                        )}
                                                    >
                                                        {paymentMethod === method.id && (
                                                            <div className="absolute top-2 right-2">
                                                                <CheckCircle2 size={18} className="text-[#f37021]" />
                                                            </div>
                                                        )}
                                                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-all", paymentMethod === method.id ? "bg-[#f37021] text-white" : "bg-white/5 text-white/40")}>
                                                            <method.icon size={20} />
                                                        </div>
                                                        <p className="font-bold text-sm text-white">{method.name}</p>
                                                        <p className="text-[10px] text-white/50">{method.desc}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Fields for Manual Verification */}
                                        <AnimatePresence>
                                            {invoiceId && paymentMethod && !ALL_PAYMENT_METHODS.filter(m => m.type === 'auto').some(m => m.id === paymentMethod) && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="bg-[#162a31] border border-white/10 rounded-xl p-6 shadow-lg space-y-4 overflow-hidden">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <ShieldCheck size={16} className="text-[#f37021]" />
                                                        <h4 className="text-xs font-bold text-white">Proof of Payment</h4>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-xs font-bold text-white/60">Transaction ID (TrxID)</Label>
                                                            <Input
                                                                placeholder="Enter ID here"
                                                                className="h-10 rounded-lg bg-white/5 border-white/10 text-white font-bold uppercase focus:border-[#f37021] placeholder:text-white/40"
                                                                value={trxId}
                                                                onChange={(e) => setTrxId(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-xs font-bold text-white/60">Your Account Number</Label>
                                                            <Input
                                                                placeholder="01XXXXXXXXX"
                                                                className="h-10 rounded-lg bg-white/5 border-white/10 text-white font-bold focus:border-[#f37021] placeholder:text-white/40"
                                                                value={senderNumber}
                                                                onChange={(e) => setSenderNumber(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="bg-[#162a31] border border-white/10 rounded-xl p-6 shadow-lg space-y-4">
                                            <div className="flex items-start gap-3 text-left bg-white/5 p-4 rounded-xl border border-white/5">
                                                <Checkbox
                                                    id="agreeCheckout"
                                                    checked={agreeToPolicies}
                                                    onChange={(e: any) => setAgreeToPolicies(e.target.checked)}
                                                    className="mt-0"
                                                />
                                                <Label htmlFor="agreeCheckout" className="text-[11px] leading-relaxed text-white/60 cursor-pointer select-none">
                                                    I have read and agree to the{" "}
                                                    <Link href="/terms" className="text-[#f37021] font-bold hover:underline">Terms & Conditions</Link>,{" "}
                                                    <Link href="/privacy" className="text-[#f37021] font-bold hover:underline">Privacy Policy</Link>, and{" "}
                                                    <Link href="/refund" className="text-[#f37021] font-bold hover:underline">Refund Policy</Link>.
                                                </Label>
                                            </div>
                                            <Button
                                                onClick={handleCompleteOrder}
                                                disabled={loading}
                                                className="w-full h-11 rounded-lg font-bold text-sm bg-[#f37021] hover:bg-[#d9621c] text-white shadow-lg flex items-center justify-center gap-2"
                                            >
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                                    <>
                                                        Complete Order <Zap size={16} fill="currentColor" />
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 4 && (
                                    <motion.div key="step4" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#162a31] border border-white/10 rounded-xl p-10 text-center shadow-2xl relative overflow-hidden">
                                        <div className="relative z-10 flex flex-col items-center">
                                            <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-400 border border-emerald-500/20">
                                                <CheckCircle className="w-10 h-10" />
                                            </div>
                                            <h2 className="text-3xl font-bold text-white mb-4">Order Successful</h2>
                                            <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
                                                <p className="text-white/80 font-medium text-xs">Order Number: <span className="text-[#f37021] font-bold">#{completedOrder?.orderNumber}</span></p>
                                            </div>
                                            <p className="text-white/50 text-base mb-8 max-w-sm mx-auto">We've received your order! You can now manage your account or pay the invoice below.</p>

                                            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
                                                <Link href={`/client/checkout?invoiceId=${completedOrder?.invoices?.[0]?.id || completedOrder?.id}`} className="flex-1">
                                                    <Button className="w-full h-11 rounded-lg font-bold text-sm bg-[#f37021] text-white shadow-lg">Pay Now</Button>
                                                </Link>
                                                <Link href="/client" className="flex-1">
                                                    <Button variant="outline" className="w-full h-11 rounded-lg font-bold text-sm border-white/10 text-white bg-white/5">Client Dashboard</Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Order Summary Sidebar */}
                        {step !== 4 && (
                            <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-4">
                                <AnimatePresence mode="wait">
                                    {paymentMethod && ALL_PAYMENT_METHODS.find(m => m.id === paymentMethod) && (
                                        <motion.div
                                            key={paymentMethod}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="bg-[#162a31] border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                                        >
                                            {(() => {
                                                const method = ALL_PAYMENT_METHODS.find(m => m.id === paymentMethod);
                                                if (!method) return null;

                                                if (method.type === 'auto') {
                                                    return (
                                                        <>
                                                            <div className="bg-gradient-to-r from-[#f37021] to-[#d9621c] p-4 flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                                                                    <Zap size={18} fill="currentColor" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-xs font-black uppercase tracking-widest text-white leading-none mb-1">How to Pay</h4>
                                                                    <p className="text-[10px] text-white/80 font-bold">Automated Merchant Payment</p>
                                                                </div>
                                                            </div>
                                                            <div className="p-6 text-center space-y-4">
                                                                <div className="w-12 h-12 bg-[#f37021]/10 rounded-full flex items-center justify-center mx-auto text-[#f37021] border border-[#f37021]/20">
                                                                    <CheckCircle2 size={24} />
                                                                </div>
                                                                <p className="text-[11px] text-white/70 font-medium leading-relaxed">
                                                                    Payment will be verified instantly. You will be redirected to Nagad secure checkout.
                                                                </p>
                                                            </div>
                                                        </>
                                                    );
                                                }

                                                const refValue = invoice?.invoiceNumber || (invoiceId ? `#${invoiceId}` : 'Your Invoice #');
                                                const enInstr = (method as any).instructions.en.replace('Your Invoice #', refValue);
                                                const bnInstr = (method as any).instructions.bn.replace('আপনার ইনভয়েস নম্বর ব্যবহার করুন', refValue).replace('আপনার ইনভয়েস নম্বর', refValue);

                                                return (
                                                    <>
                                                        <div className="bg-gradient-to-r from-[#f37021] to-[#d9621c] p-4 flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                                                                <Zap size={18} fill="currentColor" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-xs font-black uppercase tracking-widest text-white leading-none mb-1">How to Pay</h4>
                                                                <p className="text-[10px] text-white/80 font-bold">{method.id.includes('personal') || method.id.includes('manual') ? 'Cashout Charge Required' : 'Manual Instructions'}</p>
                                                            </div>
                                                        </div>

                                                        <div className="p-5 space-y-5">
                                                            <div className="space-y-3">
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-[#f37021] bg-[#f37021]/10 px-2 py-0.5 rounded">English</span>
                                                                <div className="space-y-2.5">
                                                                    {enInstr.split('\n').map((line: string, idx: number) => (
                                                                        <div key={idx} className="flex gap-2.5 items-start">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-[#f37021] mt-1.5 shrink-0" />
                                                                            <p className="text-[11px] text-white/80 font-medium leading-relaxed">{line.replace(/^\d\.\s*/, '')}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="h-px bg-white/5 w-full" />

                                                            <div className="space-y-3 font-sans">
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-[#f37021] bg-[#f37021]/10 px-2 py-0.5 rounded">বাংলা</span>
                                                                <div className="space-y-2.5">
                                                                    {bnInstr.split('\n').map((line: string, idx: number) => (
                                                                        <div key={idx} className="flex gap-2.5 items-start">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-[#f37021] mt-1.5 shrink-0" />
                                                                            <p className="text-[11px] text-white/90 font-medium leading-loose">{line.replace(/^\d\.\s*/, '')}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-[#162a31] border border-white/10 rounded-xl p-6 shadow-lg">
                                    <h4 className="text-xs font-bold text-white/60 mb-6 flex items-center gap-2">
                                        <Receipt size={14} className="text-[#f37021]" /> Summary
                                    </h4>

                                    <div className="space-y-3 pb-6 border-b border-white/5">
                                        <div className="flex justify-between items-center text-sm font-medium">
                                            <span className="text-white/60">Subtotal</span>
                                            <span className="text-white">{isMounted ? formatPrice(items.reduce((acc, i) => acc + (Number(i.price || 0) * (i.quantity || 1)) + Number(i.setupFee || 0), 0)) : formatPrice(0)}</span>
                                        </div>
                                        {promoCode && (
                                            <div className="flex justify-between items-center text-[#f37021] text-xs bg-[#f37021]/10 p-2 rounded-lg border border-[#f37021]/20">
                                                <span className="flex items-center gap-2"><Tag size={12} fill="currentColor" /> Discount</span>
                                                <span className="font-bold">-20%</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center text-white/60 text-sm">
                                            <span>Tax</span>
                                            <span className="text-white/80">{formatPrice(0)}</span>
                                        </div>
                                    </div>

                                    <div className="pt-6 flex flex-col items-end">
                                        <span className="text-xs text-white/60 mb-1">Total Payable</span>
                                        <span className="text-3xl font-bold text-[#f37021] leading-none">
                                            {isMounted ? formatPrice(total()) : formatPrice(0)}
                                        </span>
                                    </div>

                                    {!invoiceId && step === 1 && (
                                        <div className="pt-6 space-y-2">
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Promo Code"
                                                    value={promoInput}
                                                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                                                    className="h-10 rounded-lg bg-white/5 border-white/10 text-white font-bold text-sm focus:border-[#f37021]"
                                                />
                                                <Button onClick={handleApplyPromo} className="h-10 rounded-lg bg-white text-[#0f1d22] font-bold text-xs hover:bg-white/90">Apply</Button>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>

                                <div className="bg-[#162a31] border border-white/10 rounded-xl p-4 flex gap-3 items-start shadow-inner">
                                    <ShieldCheck className="text-[#f37021] mt-0.5 shrink-0" size={18} />
                                    <div>
                                        <p className="font-bold text-white text-xs mb-0.5">Secure Checkout</p>
                                        <p className="text-[10px] leading-relaxed text-white/40">
                                            Your data is encrypted and secure.
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
