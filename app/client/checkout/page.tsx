"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
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
    Receipt,
    AlertCircle
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
import { useWhiteLabel } from "@/components/white-label-provider";

function CheckoutContent() {
    const { t } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();
    const invoiceId = searchParams.get("invoiceId");

    const { items, removeItem, updateItem, clearCart, total, promoCode, setPromoCode, updateDomainName } = useCartStore();
    const { user } = useAuthStore();
    const { formatPrice } = useSettingsStore();
    const { isReseller: isWhiteLabel, resellerId: ownerId } = useWhiteLabel();

    const [step, setStep] = useState(invoiceId ? 3 : 1);
    const [loading, setLoading] = useState(false);
    const [promoInput, setPromoInput] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("card");
    const [invoice, setInvoice] = useState<any>(null);
    const [trxId, setTrxId] = useState("");
    const [senderNumber, setSenderNumber] = useState("");
    const [isMounted, setIsMounted] = useState(false);

    // Domain Search for missing domain items
    const [domainInputs, setDomainInputs] = useState<Record<string, string>>({});
    const [domainTargetItem, setDomainTargetItem] = useState<string | null>(null);
    const [checkingDomainId, setCheckingDomainId] = useState<string | null>(null);

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
            router.push("/client/billing");
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
            toast.error("Failed to connect to domain registry. Please try again.");
        } finally {
            setCheckingDomainId(null);
        }
    };

    const [completedOrder, setCompletedOrder] = useState<any>(null);
    const [agreeToPolicies, setAgreeToPolicies] = useState(false);

    const handleCompleteOrder = async () => {
        // Validation: Check if any domain items are missing domain names
        if (!agreeToPolicies) {
            toast.error("Please agree to our Terms, Privacy, and Refund policies to continue.");
            return;
        }

        const missingDomain = items.find(i => i.type === 'DOMAIN' && !i.domainName);
        if (!invoiceId && missingDomain) {
            toast.error(`Please set a domain name for ${missingDomain.name}`);
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
                        toast.error("Provide Transaction ID and Sender Phone");
                        setLoading(false);
                        return;
                    }
                    await api.post("/invoices/manual-payment", {
                        invoiceId: invoice.id,
                        gateway: paymentMethod,
                        transactionId: trxId,
                        senderNumber: senderNumber
                    });
                    toast.success("Payment proof sent! We will verify it soon.");
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
                        billingCycle: i.billingCycle || (i.type === 'DOMAIN' ? 'ANNUALLY' : 'MONTHLY'),
                        quantity: i.quantity || 1,
                    };

                    // For domain items (id starts with 'dom-'), include domainName
                    // Note: If we have a real productId (not starting with dom-), we MUST send it.
                    if (i.id.startsWith('dom-')) {
                        orderItem.domainName = i.domainName;
                        // For legacy dom- items, we might fail if backend requires productId. 
                        // But let's assume specific backend handling or that these are filtered out.
                        // Actually, to be safe, if it's a dom- item and we have no productId, we are in trouble.
                        // But usually we don't fix the legacy data here, just the payload structure.
                    } else {
                        // For regular products (and now properly configured domains), parse the id as productId
                        orderItem.productId = parseInt(i.id);
                        if (i.domainName) {
                            orderItem.domainName = i.domainName;
                        }
                    }

                    return orderItem;
                }),
                paymentMethod: paymentMethod,
                promoCode: promoCode || undefined,
                resellerId: isWhiteLabel ? ownerId : null,
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
            toast.error(err.response?.data?.message || "Failed to process order.");
        } finally {
            setLoading(false);
        }
    };

    if (isMounted && !invoiceId && items.length === 0 && step !== 4) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <Sidebar />
                <main className="lg:pl-72 pt-[15vh] flex flex-col items-center justify-center p-4 text-center">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-10 rounded-full bg-secondary/30 mb-6">
                        <ShoppingBag className="w-16 h-16 text-primary" />
                    </motion.div>
                    <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
                    <p className="text-muted-foreground mb-8 max-w-xs">Look around our store to find the perfect services for you.</p>
                    <Button asChild pill className="px-8 font-bold">
                        <Link href="/client/store">Browse Services</Link>
                    </Button>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <Sidebar />
            <main className="lg:pl-72 pt-20 pb-20 p-4 md:p-6">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-10">
                        <h1 className="text-3xl font-bold tracking-tight mb-2">
                            {step === 4 ? "Success!" : "Complete Purchase"}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            {step === 4 ? "Your order is being processed." : "Fill in your details and pay to get started."}
                        </p>
                    </div>

                    {/* Simple Step Indicator */}
                    {step < 4 && (
                        <div className="flex items-center gap-2 mb-8 bg-card border rounded-2xl p-2 w-fit mx-auto sm:mx-0">
                            {[1, 2, 3].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => step > s && setStep(s)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                                        step === s ? "bg-primary text-primary-foreground shadow-sm" : step > s ? "text-primary hover:bg-primary/5" : "text-muted-foreground opacity-50 cursor-default"
                                    )}
                                >
                                    <div className={cn("w-4 h-4 rounded-full flex items-center justify-center text-[10px] border", step === s ? "bg-primary-foreground text-primary border-transparent" : "border-current")}>
                                        {step > s ? <CheckCircle size={10} strokeWidth={3} /> : s}
                                    </div>
                                    {s === 1 ? "Cart" : s === 2 ? "Account" : "Payment"}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        <div className="lg:col-span-8">
                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div key="step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                                        <div className="bg-card border rounded-2xl overflow-hidden">
                                            <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
                                                <h3 className="text-sm font-bold flex items-center gap-2 px-1">
                                                    <ShoppingBag size={16} className="text-primary" />
                                                    Order Items ({isMounted ? items.length : 0})
                                                </h3>
                                            </div>
                                            <div className="divide-y">
                                                {isMounted && items.map((item) => (
                                                    <div key={item.cartId} className="p-4 transition-colors hover:bg-muted/5">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                                    {item.type === 'DOMAIN' ? <Globe size={18} /> : <Server size={18} />}
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <h4 className="font-bold text-sm leading-tight">{item.name}</h4>
                                                                    <div className="flex flex-wrap gap-2 items-center mt-1">
                                                                        {(() => {
                                                                            const monthly = Number(item.monthlyPrice || 0);
                                                                            const annual = Number(item.annualPrice || 0);
                                                                            if (monthly > 0 && annual > 0 && monthly !== annual) {
                                                                                return (
                                                                                    <div className="flex items-center bg-secondary/50 rounded-lg p-0.5 border">
                                                                                        <button
                                                                                            onClick={() => updateItem(item.cartId!, { billingCycle: 'MONTHLY', price: monthly })}
                                                                                            className={cn(
                                                                                                "px-2 py-0.5 text-[10px] rounded-md font-bold transition-all",
                                                                                                item.billingCycle === 'MONTHLY' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                                                                                            )}
                                                                                        >
                                                                                            Monthly
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => updateItem(item.cartId!, { billingCycle: 'ANNUALLY', price: annual })}
                                                                                            className={cn(
                                                                                                "px-2 py-0.5 text-[10px] rounded-md font-bold transition-all",
                                                                                                item.billingCycle === 'ANNUALLY' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                                                                                            )}
                                                                                        >
                                                                                            Annually
                                                                                        </button>
                                                                                    </div>
                                                                                );
                                                                            }
                                                                            return <Badge variant="secondary" className="text-[10px] h-5">{item.billingCycle}</Badge>;
                                                                        })()}
                                                                        {item.type === 'DOMAIN' && (
                                                                            item.domainName ? (
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-[11px] text-emerald-600 font-bold bg-emerald-500/5 px-2 py-0.5 rounded-md border border-emerald-500/10 flex items-center gap-1">
                                                                                        <CheckCircle size={10} /> {item.domainName}
                                                                                    </span>
                                                                                    <button
                                                                                        onClick={() => setDomainTargetItem(domainTargetItem === item.cartId ? null : item.cartId!)}
                                                                                        className="text-[10px] text-primary font-bold hover:underline"
                                                                                    >
                                                                                        Change
                                                                                    </button>
                                                                                </div>
                                                                            ) : (
                                                                                <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                                                                                    <Zap size={10} /> Action Required
                                                                                </span>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-bold text-sm">{formatPrice(item.price)}</p>
                                                                {item.setupFee && Number(item.setupFee) > 0 && (
                                                                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                                                                        + {formatPrice(item.setupFee)} {t('setup_fee')}
                                                                    </p>
                                                                )}
                                                                <button onClick={() => removeItem(item.cartId!)} className="text-muted-foreground hover:text-destructive transition-colors mt-1">
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Inline Domain Config */}
                                                        <AnimatePresence>
                                                            {(domainTargetItem === item.cartId || (item.type === 'DOMAIN' && !item.domainName)) && (
                                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-4 pt-4 border-t border-dashed overflow-hidden">
                                                                    <Label className="text-xs font-bold mb-2 block">Choose your domain name</Label>
                                                                    <div className="flex gap-2">
                                                                        <div className="relative flex-1">
                                                                            <Input
                                                                                placeholder="mysite.com"
                                                                                className="h-10 rounded-xl"
                                                                                value={domainInputs[item.cartId!] || ""}
                                                                                onChange={(e) => setDomainInputs(prev => ({ ...prev, [item.cartId!]: e.target.value }))}
                                                                            />
                                                                        </div>
                                                                        <Button
                                                                            size="sm"
                                                                            disabled={checkingDomainId === item.cartId}
                                                                            onClick={() => validateAndSetDomain(item.cartId!)}
                                                                        >
                                                                            {checkingDomainId === item.id ? (
                                                                                <>
                                                                                    <Loader2 size={14} className="animate-spin mr-2" />
                                                                                    Checking...
                                                                                </>
                                                                            ) : (
                                                                                item.domainName ? "Update Domain" : "Set Domain"
                                                                            )}
                                                                        </Button>
                                                                        {item.domainName && !checkingDomainId && <Button variant="ghost" size="sm" onClick={() => setDomainTargetItem(null)}>Cancel</Button>}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center bg-card border rounded-2xl p-4">
                                            <Button variant="ghost" size="sm" asChild className="font-bold text-muted-foreground">
                                                <Link href="/client/store"><ArrowLeft size={16} className="mr-2" /> Back to Store</Link>
                                            </Button>
                                            <Button onClick={() => setStep(2)} pill className="px-10 font-bold group bg-[#f37021] hover:bg-[#d9621c] text-white shadow-lg shadow-[#f37021]/20">
                                                Continue
                                                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div key="step2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                                        <div className="bg-card border rounded-2xl p-6 space-y-6">
                                            <div className="flex items-center gap-3 border-b pb-4">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                    <Lock size={16} />
                                                </div>
                                                <h3 className="text-sm font-bold">Personal Details</h3>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs text-muted-foreground">Full Name</Label>
                                                    <div className="p-2.5 rounded-xl bg-muted/30 border text-sm font-semibold">
                                                        {user?.firstName} {user?.lastName}
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs text-muted-foreground">Email Address</Label>
                                                    <div className="p-2.5 rounded-xl bg-muted/30 border text-sm font-semibold">
                                                        {user?.email}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 text-primary border border-primary/10">
                                                <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                                                <p className="text-[11px] font-medium leading-relaxed">
                                                    We use these details for your legal invoices and service registration.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center bg-card border rounded-2xl p-4">
                                            <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="font-bold text-muted-foreground">
                                                <ArrowLeft size={16} className="mr-2" /> Review Cart
                                            </Button>
                                            <Button onClick={() => setStep(3)} pill className="px-10 font-bold group bg-[#f37021] hover:bg-[#d9621c] text-white shadow-lg shadow-[#f37021]/20">
                                                Choose Payment
                                                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div key="step3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                                        <div className="bg-card border rounded-3xl p-6 shadow-sm">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                                    <CreditCard size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold">Payment Method</h3>
                                                    <p className="text-xs text-muted-foreground">Select how you want to pay</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {paymentMethod === 'mobile' && !invoiceId && (
                                                    <div className="col-span-full mb-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-3">
                                                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                                        <p className="text-[11px] text-amber-700 font-medium">Automatic bKash is only available for existing invoices. For new orders, please use manual methods below.</p>
                                                    </div>
                                                )}
                                                {ALL_PAYMENT_METHODS.map((method) => (
                                                    <button
                                                        key={method.id}
                                                        onClick={() => setPaymentMethod(method.id)}
                                                        className={cn(
                                                            "p-4 rounded-xl border transition-all group relative overflow-hidden text-left",
                                                            paymentMethod === method.id
                                                                ? "border-[#f37021] bg-[#f37021]/5"
                                                                : "border-border bg-muted/20 hover:border-primary/20"
                                                        )}
                                                    >
                                                        {paymentMethod === method.id && (
                                                            <div className="absolute top-2 right-2">
                                                                <CheckCircle2 size={16} className="text-[#f37021]" />
                                                            </div>
                                                        )}
                                                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-all", paymentMethod === method.id ? "bg-[#f37021] text-white" : "bg-primary/10 text-primary")}>
                                                            <method.icon size={18} />
                                                        </div>
                                                        <p className="font-bold text-sm">{method.name}</p>
                                                        <p className="text-[10px] text-muted-foreground">{method.desc}</p>
                                                    </button>
                                                ))}

                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {paymentMethod === 'card' && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20">
                                                        <ShieldCheck size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">Secure Global Payment</p>
                                                        <p className="text-xs text-muted-foreground">You will be redirected to Stripe to finish your payment securely.</p>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {invoiceId && paymentMethod && paymentMethod !== 'card' && !ALL_PAYMENT_METHODS.filter(m => m.type === 'auto').some(m => m.id === paymentMethod) && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="bg-card border rounded-2xl p-5 shadow-sm space-y-4 overflow-hidden">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <ShieldCheck size={18} className="text-primary" />
                                                        <h4 className="text-sm font-bold">Proof of Payment</h4>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-xs font-bold text-muted-foreground">Transaction ID / TrxID</Label>
                                                            <Input
                                                                placeholder="Enter Transaction ID"
                                                                className="h-10 rounded-xl font-bold uppercase"
                                                                value={trxId}
                                                                onChange={(e) => setTrxId(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-xs font-bold text-muted-foreground">Your Account / Phone Number</Label>
                                                            <Input
                                                                placeholder="e.g. 01712345678"
                                                                className="h-10 rounded-xl font-bold"
                                                                value={senderNumber}
                                                                onChange={(e) => setSenderNumber(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="bg-card border rounded-3xl p-6 space-y-4 shadow-sm">
                                            <div className="flex items-start gap-3 text-left bg-muted/30 p-4 rounded-2xl border">
                                                <Checkbox
                                                    id="agreeClient"
                                                    checked={agreeToPolicies}
                                                    onChange={(e: any) => setAgreeToPolicies(e.target.checked)}
                                                    className="mt-0"
                                                />
                                                <Label htmlFor="agreeClient" className="text-[11px] leading-relaxed text-muted-foreground cursor-pointer select-none">
                                                    I have read and agree to the{" "}
                                                    <Link href="/terms" className="text-primary font-bold hover:underline">Terms & Conditions</Link>,{" "}
                                                    <Link href="/privacy" className="text-primary font-bold hover:underline">Privacy Policy</Link>, and{" "}
                                                    <Link href="/refund" className="text-primary font-bold hover:underline">Refund Policy</Link>.
                                                </Label>
                                            </div>
                                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                                        <Lock size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">Secure Transaction</p>
                                                        <p className="text-[10px] text-muted-foreground">SSL encrypted payment processing</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={handleCompleteOrder}
                                                    disabled={loading}
                                                    size="lg"
                                                    className="w-full sm:w-auto rounded-xl px-10 h-12 font-bold text-sm shadow-lg shadow-primary/20"
                                                >
                                                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" fill="currentColor" />}
                                                    Complete Order
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 4 && (
                                    <motion.div key="step4" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-12 bg-card border rounded-3xl text-center flex flex-col items-center">
                                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 text-emerald-500">
                                            <CheckCircle className="w-10 h-10" />
                                        </div>
                                        <h2 className="text-2xl font-bold mb-2">Order Success!</h2>
                                        <p className="text-muted-foreground mb-1">Your order number is <span className="text-foreground font-bold">#{completedOrder?.orderNumber}</span></p>
                                        <p className="text-xs text-muted-foreground mb-10 max-w-xs">We've sent a confirmation email to you. Your services are being set up now.</p>

                                        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm px-6">
                                            <Button asChild className="flex-1 rounded-xl h-11 font-bold">
                                                <Link href={`/client/checkout?invoiceId=${completedOrder?.invoices?.[0]?.id || completedOrder?.id}`}>
                                                    Make The Payment
                                                </Link>
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Order Summary Sidebar */}
                        {step !== 4 && (
                            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
                                <AnimatePresence mode="wait">
                                    {paymentMethod && ALL_PAYMENT_METHODS.find(m => m.id === paymentMethod) && (
                                        <motion.div
                                            key={paymentMethod}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="bg-card border rounded-2xl overflow-hidden shadow-md"
                                        >
                                            {(() => {
                                                const method = ALL_PAYMENT_METHODS.find(m => m.id === paymentMethod);
                                                if (!method) return null;

                                                if (method.type === 'auto') {
                                                    return (
                                                        <>
                                                            <div className="bg-primary p-4 flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center text-primary-foreground">
                                                                    <Zap size={18} fill="currentColor" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary-foreground/70 leading-none mb-1">How to Pay</h4>
                                                                    <p className="text-xs text-primary-foreground font-bold truncate max-w-[150px]">Automated Merchant Payment</p>
                                                                </div>
                                                            </div>
                                                            <div className="p-6 text-center space-y-4">
                                                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary border border-primary/20">
                                                                    <CheckCircle2 size={24} />
                                                                </div>
                                                                <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
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
                                                        <div className="bg-primary p-4 flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center text-primary-foreground">
                                                                <Zap size={18} fill="currentColor" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary-foreground/70 leading-none mb-1">How to Pay</h4>
                                                                <p className="text-xs text-primary-foreground font-bold truncate max-w-[150px]">{method.name}</p>
                                                            </div>
                                                        </div>

                                                        <div className="p-5 space-y-5">
                                                            <div className="space-y-3">
                                                                <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded">English Guide</span>
                                                                <div className="space-y-2.5">
                                                                    {enInstr.split('\n').map((line: string, idx: number) => (
                                                                        <div key={idx} className="flex gap-2.5 items-start">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                                                            <p className="text-[11px] text-foreground/80 font-medium leading-relaxed">{line.replace(/^\d\.\s*/, '')}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="h-px bg-border w-full" />

                                                            <div className="space-y-3 font-sans">
                                                                <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded">বাংলা নির্দেশিকা</span>
                                                                <div className="space-y-2.5">
                                                                    {bnInstr.split('\n').map((line: string, idx: number) => (
                                                                        <div key={idx} className="flex gap-2.5 items-start">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                                                            <p className="text-[11px] text-foreground/90 font-medium leading-loose">{line.replace(/^\d\.\s*/, '')}</p>
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

                                <div className="bg-card border rounded-2xl p-5 shadow-sm">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                                        <Receipt size={14} /> Price Summary
                                    </h4>

                                    <div className="space-y-3 pb-4 border-b">
                                        {(() => {
                                            const subtotal = isMounted && (invoiceId && invoice) ? parseFloat(invoice.subtotal) : (isMounted ? items.reduce((acc, i) => acc + (Number(i.price || 0) * (i.quantity || 1)) + Number(i.setupFee || 0), 0) : 0);
                                            const discount = isMounted && promoCode === 'SAVE20' ? subtotal * 0.2 : 0;
                                            const discountedSubtotal = subtotal - discount;
                                            const tax = isMounted && (invoiceId && invoice) ? parseFloat(invoice.taxAmount) : discountedSubtotal * 0.05;
                                            const finalTotal = isMounted && (invoiceId && invoice) ? parseFloat(invoice.totalAmount) : discountedSubtotal + tax;

                                            return (
                                                <>
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-muted-foreground">Original Price</span>
                                                        <span className="font-bold">{formatPrice(subtotal)}</span>
                                                    </div>

                                                    {promoCode && (
                                                        <div className="flex justify-between items-center text-xs text-emerald-600 font-bold bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                                                            <span className="flex items-center gap-1"><Tag size={10} /> SAVED 20%</span>
                                                            <span>-{formatPrice(discount)}</span>
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-muted-foreground text-xs">Tax ({invoiceId && invoice ? "Included" : "5%"})</span>
                                                        <span className="font-bold">{formatPrice(tax)}</span>
                                                    </div>

                                                    <div className="pt-4 mb-0 flex justify-between items-end">
                                                        <div className="space-y-0.5">
                                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Grand Total</p>
                                                            <p className="text-xs text-muted-foreground font-medium">Final amount to pay</p>
                                                        </div>
                                                        <span className="text-2xl font-black text-[#f37021] tracking-tighter">
                                                            {formatPrice(finalTotal)}
                                                        </span>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>

                                    {!invoiceId && (
                                        <div className="pt-4 space-y-3">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Promo Code</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Enter code"
                                                    value={promoInput}
                                                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                                                    className="h-9 rounded-xl text-xs font-bold"
                                                />
                                                <Button size="sm" onClick={handleApplyPromo} variant="secondary" className="font-bold">Apply</Button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex gap-3 items-start">
                                    <ShieldCheck className="text-primary mt-1 shrink-0" size={16} />
                                    <p className="text-[10px] leading-relaxed text-muted-foreground">
                                        Your payment is secured with 256-bit encryption. Activation is usually immediate for card payments.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}


