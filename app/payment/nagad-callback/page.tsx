"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Loader2, CheckCircle2, XCircle, ArrowRight, Receipt, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

function NagadCallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "success" | "error" | "cancelled">("loading");
    const [message, setMessage] = useState("");
    const [invoiceId, setInvoiceId] = useState<string | null>(null);

    const payment_ref_id = searchParams.get("payment_ref_id");
    const nagadStatus = searchParams.get("status");

    useEffect(() => {
        const verifyPayment = async () => {
            if (!payment_ref_id) {
                setStatus("error");
                setMessage("Invalid payment reference.");
                return;
            }

            if (nagadStatus === "Aborted") {
                setStatus("cancelled");
                setMessage("Payment process was cancelled.");
                return;
            }

            try {
                const response = await api.get(`/payments/nagad/callback?payment_ref_id=${payment_ref_id}&status=${nagadStatus}`);

                if (response.data.data.paymentStatus === "SUCCESS") {
                    setStatus("success");
                    setMessage(response.data.data.message || "Payment verified successfully!");
                    setInvoiceId(response.data.data.invoiceId);
                } else {
                    setStatus("error");
                    setMessage(response.data.data.message || "Payment verification failed.");
                    setInvoiceId(response.data.data.invoiceId);
                }
            } catch (error: any) {
                console.error("Nagad verification error:", error);
                setStatus("error");
                setMessage(error.response?.data?.message || "Something went wrong during verification.");
            }
        };

        verifyPayment();
    }, [payment_ref_id, nagadStatus]);

    return (
        <div className="min-h-screen bg-[#0f1d22] flex items-center justify-center p-6 text-white font-sans">
            <div className="fixed inset-0 bg-[#0f1d22] z-0" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative z-10 w-full max-w-md bg-[#162a31] border border-white/10 rounded-2xl p-10 shadow-2xl text-center"
            >
                {status === "loading" && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-[#f37021]/10 rounded-3xl flex items-center justify-center mx-auto border border-[#f37021]/20">
                            <Loader2 size={40} className="text-[#f37021] animate-spin" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-white tracking-tight uppercase">Verifying Payment</h2>
                            <p className="text-white/60 text-sm font-medium">Please wait while we confirm your transaction with Nagad...</p>
                        </div>
                    </div>
                )}

                {status === "success" && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/20 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]">
                            <CheckCircle2 size={40} className="text-emerald-400" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-white tracking-tight uppercase">Payment Successful!</h2>
                            <p className="text-white/60 text-sm font-medium">{message}</p>
                        </div>
                        <div className="pt-4 space-y-3">
                            <Link href="/client/transactions" className="block w-full">
                                <Button className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[11px] shadow-lg shadow-emerald-500/20">
                                    View Transactions <ArrowRight size={14} className="ml-2" />
                                </Button>
                            </Link>
                            <Link href="/client/services" className="block w-full">
                                <Button variant="outline" className="w-full h-12 rounded-xl border-white/10 hover:border-white/20 hover:bg-white/5 text-white/60 hover:text-white font-black uppercase tracking-widest text-[11px]">
                                    Go to Services <ExternalLink size={14} className="ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}

                {status === "error" && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto border border-rose-500/20 shadow-[0_0_40px_-10px_rgba(244,63,94,0.3)]">
                            <XCircle size={40} className="text-rose-400" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-white tracking-tight uppercase">Oops! Failed</h2>
                            <p className="text-rose-400/80 text-sm font-medium">{message}</p>
                        </div>
                        <div className="pt-4 space-y-3">
                            <Link href={invoiceId ? `/client/checkout?invoiceId=${invoiceId}` : "/client"} className="block w-full">
                                <Button className="w-full h-12 rounded-xl bg-[#f37021] hover:bg-[#d9621c] text-white font-black uppercase tracking-widest text-[11px] shadow-lg shadow-[#f37021]/20">
                                    Try Again <ArrowRight size={14} className="ml-2" />
                                </Button>
                            </Link>
                            <Link href="/client/support" className="block w-full">
                                <Button variant="outline" className="w-full h-12 rounded-xl border-white/10 border-white/20 bg-white/5 text-white/60 text-white font-black uppercase tracking-widest text-[11px]">
                                    Contact Support
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}

                {status === "cancelled" && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto border border-amber-500/20 shadow-[0_0_40px_-10px_rgba(245,158,11,0.3)]">
                            <XCircle size={40} className="text-amber-400" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-white tracking-tight uppercase">Payment Cancelled</h2>
                            <p className="text-white/60 text-sm font-medium">{message}</p>
                        </div>
                        <div className="pt-4 space-y-3">
                            <Link href={invoiceId ? `/client/checkout?invoiceId=${invoiceId}` : "/client"} className="block w-full">
                                <Button className="w-full h-12 rounded-xl bg-white text-[#0f1d22] hover:bg-white/90 font-black uppercase tracking-widest text-[11px]">
                                    Go Back to Checkout <ArrowRight size={14} className="ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

export default function NagadCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0f1d22] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#f37021]" />
            </div>
        }>
            <NagadCallbackContent />
        </Suspense>
    );
}
