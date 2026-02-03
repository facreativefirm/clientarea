"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { XCircle, ArrowRight, LifeBuoy, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

function FailedContent() {
    const searchParams = useSearchParams();

    const invoiceId = searchParams.get("invoiceId");
    const msg = searchParams.get("msg") || "The transaction could not be completed at this time.";

    return (
        <div className="min-h-screen bg-[#0f1d22] flex items-center justify-center p-6 text-white font-sans">
            <div className="fixed inset-0 bg-[#0f1d22] z-0" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative z-10 w-full max-w-md bg-[#162a31] border border-white/10 rounded-3xl p-10 shadow-2xl text-center"
            >
                <div className="mb-8">
                    <div className="w-24 h-24 bg-rose-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto border border-rose-500/20 shadow-[0_0_50px_-10px_rgba(244,63,94,0.3)] mb-6">
                        <XCircle size={48} className="text-rose-400" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase mb-2">Payment Failed</h1>
                    <p className="text-rose-400/80 text-sm font-medium">{msg}</p>
                </div>

                <div className="space-y-3">
                    {invoiceId && (
                        <Link href={`/client/checkout?invoiceId=${invoiceId}`} className="block w-full">
                            <Button className="w-full h-14 rounded-2xl bg-[#f37021] hover:bg-[#d9621c] text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-[#f37021]/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                <RefreshCcw size={16} className="mr-2" /> Try Again <ArrowRight size={16} className="ml-2" />
                            </Button>
                        </Link>
                    )}
                    <Link href="/client/support" className="block w-full">
                        <Button variant="outline" className="w-full h-14 rounded-2xl border-white/10 hover:border-white/20 bg-white/5 text-white font-black uppercase tracking-widest text-xs transition-all">
                            <LifeBuoy size={16} className="mr-2" /> Contact Support
                        </Button>
                    </Link>
                </div>

                <p className="mt-8 text-[10px] text-white/40 font-bold uppercase tracking-widest">
                    Reference Invoice: #{invoiceId || "N/A"}
                </p>
            </motion.div>
        </div>
    );
}

export default function PaymentFailedPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0f1d22] flex items-center justify-center">
                <div className="animate-pulse text-[#f37021] font-black uppercase tracking-widest">Loading...</div>
            </div>
        }>
            <FailedContent />
        </Suspense>
    );
}
