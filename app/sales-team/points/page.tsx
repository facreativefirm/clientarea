"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Loader2,
    ArrowUpRight,
    ArrowDownLeft,
    DollarSign,
    Wallet,
    TrendingUp,
    History,
    CreditCard,
    ArrowRightCircle,
    Trophy,
    Target
} from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/store/authStore";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { cn } from "@/lib/utils";

interface Transaction {
    id: number;
    transactionType: string;
    points: number;
    balanceBefore: number;
    balanceAfter: number;
    reason: string;
    createdAt: string;
}

interface MemberStats {
    totalPoints: string;
    availablePoints: string;
    withdrawnPoints: string;
}

const PointCard = ({ title, value, label, icon: Icon, colorCls, delay, currency = false, formatPrice }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.3 }}
        className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm group hover:border-gray-200 transition-all"
    >
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-lg ${colorCls} group-hover:scale-105 transition-transform`}>
                <Icon size={20} />
            </div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Wallet</div>
        </div>
        <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                {currency ? formatPrice(value) : value}
                {!currency && <span className="text-xs ml-1 text-gray-400 font-medium">pts</span>}
            </h3>
            <p className="text-[10px] font-medium text-gray-500 mt-1.5 flex items-center gap-1">
                {label}
            </p>
        </div>
    </motion.div>
);

export default function PointsPage() {
    const { user } = useAuthStore();
    const { formatPrice } = useSettingsStore();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [stats, setStats] = useState<MemberStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const txRes = await api.get('/sales-team/transactions');
                setTransactions(txRes.data.data);

                const statsRes = await api.get('/sales-team/stats/me');
                setStats(statsRes.data.data);
            } catch (err) {
                console.error("Failed to load points data", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            loadData();
        }
    }, [user]);

    const getTransactionIcon = (type: string) => {
        if (type.includes('DEDUCTION') || type.includes('WITHDRAWAL')) {
            return <ArrowDownLeft className="h-5 w-5 text-rose-500" />;
        }
        return <ArrowUpRight className="h-5 w-5 text-emerald-500" />;
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
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest mb-2">
                        <span className="w-6 h-[1.5px] bg-primary"></span>
                        Finance
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Points & Wallet</h1>
                    <p className="text-gray-500 font-medium text-sm mt-1">Manage your earnings and request payouts.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Link href="/sales-team/withdrawals">
                        <Button className="h-11 px-6 rounded-xl font-bold bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 transition-all gap-2 border-none font-sans">
                            <Wallet className="h-5 w-5" /> Withdraw
                        </Button>
                    </Link>
                </motion.div>
            </div>

            {/* Wallet Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                <PointCard
                    title="Available Balance"
                    value={stats?.availablePoints || 0}
                    label="Points ready to withdraw"
                    icon={Trophy}
                    colorCls="bg-amber-100 text-amber-600"
                    delay={0.1}
                />
                <PointCard
                    title="Lifetime Earnings"
                    value={stats?.totalPoints || 0}
                    label="Total accumulated points"
                    icon={TrendingUp}
                    colorCls="bg-primary/10 text-primary"
                    delay={0.2}
                />
                <PointCard
                    title="Total Withdrawn"
                    value={stats?.withdrawnPoints || 0}
                    label="Paid out to your bank"
                    icon={CreditCard}
                    colorCls="bg-rose-100 text-rose-600"
                    delay={0.3}
                />
            </div>

            {/* Transaction History */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
            >
                <div className="p-6 md:p-8 border-b border-gray-50 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Ledger History</h3>
                        <p className="text-gray-400 font-medium text-xs">Detailed log of all points and deductions</p>
                    </div>
                    <History className="text-gray-200" size={24} />
                </div>

                {transactions.length === 0 ? (
                    <div className="p-24 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-300">
                            <Target size={32} />
                        </div>
                        <p className="text-gray-400 font-bold text-lg">No transactions recorded yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Timestamp</th>
                                    <th className="px-6 py-4">Operation</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4 text-right">Points</th>
                                    <th className="px-6 py-4 text-right">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {transactions.map((tx, idx) => (
                                    <motion.tr
                                        key={tx.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 + (idx * 0.03), duration: 0.2 }}
                                        className="hover:bg-gray-50/50 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">
                                                {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </div>
                                            <div className="text-[10px] font-medium text-gray-400 uppercase tracking-tighter">
                                                {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "p-1.5 rounded-lg",
                                                    tx.points >= 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
                                                )}>
                                                    <div className="scale-[0.8]">
                                                        {getTransactionIcon(tx.transactionType)}
                                                    </div>
                                                </div>
                                                <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                                                    {tx.transactionType.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-gray-500 max-w-[200px] truncate">
                                            {tx.reason}
                                        </td>
                                        <td className={cn(
                                            "px-6 py-4 text-right font-bold",
                                            tx.points >= 0 ? 'text-emerald-600' : 'text-rose-600'
                                        )}>
                                            {tx.points > 0 ? '+' : ''}{tx.points}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                                            {tx.balanceAfter}
                                            <span className="text-[10px] ml-1 text-gray-400 font-medium">PTS</span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
