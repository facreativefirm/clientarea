"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    CheckCircle,
    Download,
    ArrowRight,
    LayoutDashboard,
    Mail,
    ShieldCheck,
    Loader2,
    Server,
    Globe,
    ExternalLink
} from "lucide-react";
import { useStore } from "@/components/store/StoreProvider";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/lib/store/settingsStore";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function StoreOrderConfirmationPage() {
    const { orderId } = useParams();
    const { brand } = useStore();
    const { formatPrice } = useSettingsStore();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await api.get(`/orders/${orderId}`);
                setOrder(response.data.data.order);
            } catch (error) {
                console.error("Failed to fetch order details", error);
            } finally {
                setLoading(false);
            }
        };

        if (orderId) fetchOrder();
    }, [orderId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-sm font-black text-muted-foreground uppercase tracking-widest text-center px-4">Loading secure receipt...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-4xl font-black text-foreground mb-4">Order Not Found</h1>
                <p className="text-muted-foreground mb-8">We couldn't locate the details for this transaction.</p>
                <Link href="/store">
                    <Button className="rounded-xl px-8 bg-primary">Return to Store</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-card border border-border rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
                >
                    {/* Success Background Glow */}
                    <div className="absolute inset-0 bg-emerald-500/[0.02] pointer-events-none" />

                    <div className="relative z-10">
                        {/* Status Icon */}
                        <div className="w-24 h-24 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-10 text-emerald-500 border border-emerald-500/20 shadow-xl">
                            <CheckCircle size={48} />
                        </div>

                        {/* Heading */}
                        <div className="text-center mb-12">
                            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter uppercase mb-4 leading-none">Order Confirmed!</h1>
                            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-muted/50 border border-border text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                Order ID: <span className="text-primary font-black">#{order.orderNumber}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            {/* Summary Left */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                                    <Server size={18} className="text-primary" /> Ordered Assets
                                </h3>
                                <div className="space-y-4">
                                    {order.items.map((item: any) => (
                                        <div key={item.id} className="p-4 bg-muted/30 rounded-2xl border border-border flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary shrink-0">
                                                {item.productId ? <Server size={20} /> : <Globe size={20} />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-foreground truncate">{item.product?.name || "Premium Asset"}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{item.domainName || item.billingCycle || 'Active'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Right */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                                    <ShieldCheck size={18} className="text-primary" /> Payment Details
                                </h3>
                                <div className="bg-muted/30 rounded-2xl border border-border p-6 space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Method</span>
                                        <span className="font-black text-foreground uppercase">{order.paymentMethod}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Status</span>
                                        <span className={cn("font-black px-2 py-0.5 rounded text-[10px] uppercase",
                                            order.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                                        )}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="pt-4 border-t border-border flex justify-between items-end">
                                        <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Total Paid</span>
                                        <span className="text-2xl font-black text-primary tracking-tighter">{formatPrice(order.totalAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Confirmation Steps */}
                        <div className="bg-primary/5 rounded-[2rem] p-8 border border-primary/10 mb-12">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-black shrink-0">1</div>
                                <div>
                                    <p className="font-bold text-foreground mb-1">Confirmation Email Sent</p>
                                    <p className="text-sm text-muted-foreground">We've sent an order receipt and setup instructions to your registered email address.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-black shrink-0">2</div>
                                <div>
                                    <p className="font-bold text-foreground mb-1">Infrastructure Provisioning</p>
                                    <p className="text-sm text-muted-foreground">Our automation system is currently setting up your services. Usually completes within 5-10 minutes.</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/client" className="flex-1">
                                <Button size="lg" className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs tracking-widest gap-2 shadow-xl shadow-primary/20">
                                    <LayoutDashboard size={18} />
                                    Go to Dashboard
                                </Button>
                            </Link>
                            <Link href={`/client/invoices`} className="flex-1">
                                <Button variant="outline" size="lg" className="w-full h-16 rounded-2xl border-border bg-card hover:bg-muted/50 text-foreground font-black uppercase text-xs tracking-widest gap-2">
                                    <ExternalLink size={18} />
                                    View Invoices
                                </Button>
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* Footer Note */}
                <div className="mt-12 text-center text-muted-foreground font-medium text-sm flex items-center justify-center gap-2">
                    <Mail size={16} /> Need assistance? <Link href="/store/contact" className="text-primary hover:underline font-bold">Contact Support</Link>
                </div>
            </div>
        </div>
    );
}
