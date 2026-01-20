"use client";

import { useEffect, useState } from "react";
import {
    Loader2,
    Wallet,
    History,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Clock,
    ChevronRight,
    ArrowUpRight,
    Target,
    Briefcase
} from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/store/authStore";
import { Badge } from "@/components/shared/Badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { cn } from "@/lib/utils";

interface WithdrawalRequest {
    id: number;
    requestNumber: string;
    pointsRequested: number;
    amountInCurrency: number;
    status: string;
    paymentMethod: string;
    createdAt: string;
    rejectionReason?: string;
    transactionReference?: string;
}

export default function WithdrawalsPage() {
    const { user } = useAuthStore();
    const { formatPrice } = useSettingsStore();
    const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form
    const [amount, setAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
    const [paymentDetails, setPaymentDetails] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchRequests();
    }, [user]);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/sales-team/withdrawals');
            setRequests(res.data.data);
        } catch (err) {
            console.error("Failed to load withdrawals", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setSubmitting(true);

        try {
            if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
                throw new Error("Invalid amount");
            }
            if (!paymentDetails) {
                throw new Error("Payment details are required");
            }

            await api.post('/sales-team/withdrawals', {
                points: Number(amount),
                paymentMethod,
                paymentDetails: { details: paymentDetails }
            });

            setSuccess("Withdrawal request submitted successfully!");
            setAmount("");
            setPaymentDetails("");
            fetchRequests();

        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Failed to submit request");
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'PAID': return 'success';
            case 'APPROVED': return 'info';
            case 'REJECTED': return 'destructive';
            case 'PROCESSING': return 'warning';
            default: return 'secondary';
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-4 border-t-primary"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-32">
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest mb-2">
                    <span className="w-6 h-[1.5px] bg-primary"></span>
                    Payouts
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Withdrawals</h1>
                <p className="text-gray-500 font-medium text-sm mt-1">Request payouts for your hard-earned performance points.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Request Form */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="lg:col-span-4"
                >
                    <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm sticky top-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100">
                                <Wallet size={18} />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 tracking-tight">New Request</h2>
                        </div>

                        {error && (
                            <div className="bg-rose-50 border border-rose-100 text-rose-600 text-[10px] p-3 rounded-lg mb-5 flex items-start gap-2 font-bold uppercase tracking-widest">
                                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] p-3 rounded-lg mb-5 flex items-start gap-2 font-bold uppercase tracking-widest">
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                <span>{success}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <Label htmlFor="amount" className="font-bold text-[9px] uppercase tracking-widest text-gray-400">Points to Liquidate</Label>
                                <input
                                    id="amount"
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="e.g. 500"
                                    min="1"
                                    className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 font-bold text-base focus:bg-white focus:border-primary/50 transition-all outline-none"
                                />
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                    Rate: 1 PT = {formatPrice(1)}
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="method" className="font-bold text-[9px] uppercase tracking-widest text-gray-400">Payment Vehicle</Label>
                                <select
                                    id="method"
                                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 font-bold text-xs focus:bg-white focus:border-primary/50 outline-none transition-all cursor-pointer"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                    <option value="BANK_TRANSFER">Direct Bank Transfer</option>
                                    <option value="PAYPAL">PayPal Wallet</option>
                                    <option value="CASH">Cash / Physical Check</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="details" className="font-bold text-[9px] uppercase tracking-widest text-gray-400">Financial Credentials</Label>
                                <ReviewTextArea
                                    id="details"
                                    value={paymentDetails}
                                    onChange={(e: any) => setPaymentDetails(e.target.value)}
                                    placeholder="Account Details..."
                                    rows={3}
                                />
                            </div>

                            <Button type="submit" className="w-full h-11 rounded-xl bg-gray-900 text-white font-bold shadow-sm hover:bg-gray-800 transition-all font-sans" disabled={submitting}>
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Initiate Withdrawal"}
                            </Button>
                        </form>
                    </div>
                </motion.div>

                {/* History List */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="lg:col-span-8"
                >
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                <History size={20} className="text-primary" /> Request History
                            </h3>
                        </div>

                        {requests.length === 0 ? (
                            <div className="p-20 text-center">
                                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-gray-300">
                                    <Target size={24} />
                                </div>
                                <p className="text-gray-400 font-medium text-sm">No payout history detected.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                <AnimatePresence>
                                    {requests.map((req, idx) => (
                                        <motion.div
                                            key={req.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.3 + (idx * 0.03), duration: 0.2 }}
                                            className="p-6 hover:bg-gray-50 transition-all group"
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-primary font-bold text-[10px] shadow-sm">
                                                        #{req.requestNumber.split('-').pop()}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 text-sm tracking-tight">{req.requestNumber}</h4>
                                                        <div className="text-[10px] font-medium text-gray-400 mt-0.5 flex items-center gap-1.5 uppercase tracking-widest">
                                                            <Clock size={10} />
                                                            {new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6">
                                                    <div className="text-right">
                                                        <div className="font-bold text-xl text-gray-900 tracking-tight">{req.pointsRequested}<span className="text-[10px] ml-1 text-gray-400">PTS</span></div>
                                                        <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">
                                                            ≈ {formatPrice(req.amountInCurrency)}
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={16} className="text-gray-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between mt-5 pt-4 border-t border-gray-50/50">
                                                <div className="flex items-center gap-3 text-[10px]">
                                                    <Badge variant={getStatusVariant(req.status)} className="font-bold uppercase tracking-widest text-[8px] px-2 py-0.5">
                                                        {req.status}
                                                    </Badge>
                                                    <span className="font-bold text-gray-400 px-2 py-0.5 bg-gray-50 rounded-md uppercase tracking-widest">
                                                        {req.paymentMethod.replace(/_/g, ' ')}
                                                    </span>
                                                </div>

                                                <AnimatePresence>
                                                    {req.status === 'REJECTED' && req.rejectionReason && (
                                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[9px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md uppercase tracking-widest">
                                                            {req.rejectionReason}
                                                        </motion.div>
                                                    )}

                                                    {req.status === 'PAID' && req.transactionReference && (
                                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1.5 uppercase tracking-widest">
                                                            <CheckCircle2 size={10} /> {req.transactionReference}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

// Sub-component for styled textarea
const ReviewTextArea = ({ ...props }: any) => (
    <textarea
        className="w-full rounded-xl bg-gray-50 border border-gray-200 font-medium p-3 outline-none focus:bg-white focus:border-primary/50 transition-all resize-none text-sm outline-none"
        {...props}
    />
);
