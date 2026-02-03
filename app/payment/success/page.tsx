"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, Receipt, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const invoiceId = searchParams.get("invoiceId");
    const gateway = searchParams.get("gateway")?.toUpperCase();
    const trxId = searchParams.get("trxId");

    return (
        <div className="min-h-screen bg-[#0f1d22] flex items-center justify-center p-6 text-white font-sans">
            <div className="fixed inset-0 bg-[#0f1d22] z-0" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative z-10 w-full max-w-md bg-[#162a31] border border-white/10 rounded-3xl p-10 shadow-2xl text-center"
            >
                <div className="mb-8">
                    <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto border border-emerald-500/20 shadow-[0_0_50px_-10px_rgba(16,185,129,0.3)] mb-6">
                        <CheckCircle2 size={48} className="text-emerald-400" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase mb-2">Payment Success!</h1>
                    <p className="text-white/60 text-sm font-medium">Your transaction has been verified and your account updated.</p>
                </div>

                <div className="space-y-4 bg-white/5 rounded-2xl p-6 border border-white/10 mb-8">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-white/40 font-bold uppercase tracking-widest">Gateway</span>
                        <span className="text-[#f37021] font-black">{gateway || "AUTO"}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-white/40 font-bold uppercase tracking-widest">Transaction ID</span>
                        <span className="text-white font-mono break-all ml-4 truncate">{trxId || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-white/40 font-bold uppercase tracking-widest">Invoice</span>
                        <span className="text-white font-black">#{invoiceId || "N/A"}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <Link href="/client/services" className="block w-full">
                        <Button className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                            Back to My Services <ArrowRight size={16} className="ml-2" />
                        </Button>
                    </Link>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href={`/admin/billing/${invoiceId}/print`} target="_blank">
                            <Button variant="outline" className="w-full h-12 rounded-2xl border-white/10 hover:border-white/20 bg-white/5 text-white font-black uppercase tracking-widest text-[10px] transition-all">
                                <Download size={14} className="mr-2" /> Receipt
                            </Button>
                        </Link>
                        <Link href="/client/transactions">
                            <Button variant="outline" className="w-full h-12 rounded-2xl border-white/10 hover:border-white/20 bg-white/5 text-white font-black uppercase tracking-widest text-[10px] transition-all">
                                <Receipt size={14} className="mr-2" /> History
                            </Button>
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0f1d22] flex items-center justify-center">
                <div className="animate-pulse text-[#f37021] font-black uppercase tracking-widest">Loading...</div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
