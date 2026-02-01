"use client";

import React, { useState, useEffect } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useLanguage } from "@/components/language-provider";
import {
    TrendingUp,
    DollarSign,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
    Loader2,
    Calendar,
    Briefcase
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import { useSettingsStore } from "@/lib/store/settingsStore";

const MetricCard = ({ title, value, change, icon: Icon, trend, loading }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 group shadow-sm"
    >
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Icon size={24} />
            </div>
            {change && (
                <div className={cn(
                    "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full",
                    trend === "up" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                )}>
                    {trend === "up" ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {change}
                </div>
            )}
        </div>
        <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            {loading ? (
                <div className="h-8 w-24 bg-muted animate-pulse rounded mt-1" />
            ) : (
                <h3 className="text-2xl font-bold mt-1 tracking-tight">{value}</h3>
            )}
        </div>
    </motion.div>
);

export default function InvestorDashboard() {
    const { user } = useAuthStore();
    const { formatPrice } = useSettingsStore();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/investor/stats");
            setStats(data);
        } catch (error) {
            console.error("Error fetching investor stats:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthGuard allowedRoles={["INVESTOR"]}>
            <div className="min-h-screen bg-white text-foreground transition-colors duration-300">
                <Navbar />
                <Sidebar />
                <main className="lg:pl-75 pt-20 p-4 md:p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Header */}
                        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                                    Investor <span className="text-primary">Dashboard</span>
                                </h1>
                                <p className="text-muted-foreground mt-1 text-sm md:text-base font-medium">
                                    Welcome back, {user?.firstName}. Track your portfolio performance.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                <Button asChild className="h-12 px-6 rounded-xl font-bold shadow-md bg-secondary text-white hover:bg-secondary/90 border-none">
                                    <Link href="/investor/payouts">
                                        <Wallet className="w-5 h-5 mr-3" />
                                        Request Withdrawal
                                    </Link>
                                </Button>
                            </div>
                        </header>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <MetricCard
                                title="Total Earnings"
                                value={stats ? formatPrice(stats.totalEarnings) : formatPrice(0)}
                                trend="up"
                                icon={DollarSign}
                                loading={loading}
                            />
                            <MetricCard
                                title="Paid Out"
                                value={stats ? formatPrice(stats.paidEarnings) : formatPrice(0)}
                                trend="up"
                                icon={Briefcase}
                                loading={loading}
                            />
                            <MetricCard
                                title="Pending"
                                value={stats ? formatPrice(stats.pendingEarnings) : formatPrice(0)}
                                icon={Loader2}
                                loading={loading}
                            />
                            <MetricCard
                                title="Wallet Balance"
                                value={stats ? formatPrice(stats.walletBalance) : formatPrice(0)}
                                icon={Wallet}
                                loading={loading}
                            />
                        </div>

                        {/* Recent Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 md:p-10 shadow-sm"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-xl font-extrabold">Recent Commissions</h3>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Latest Earnings</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/5 text-primary" onClick={fetchDashboardData}>
                                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {loading ? (
                                        <div className="flex justify-center p-8">
                                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : stats?.recentCommissions?.length > 0 ? (
                                        stats.recentCommissions.map((comm: any) => (
                                            <div key={comm.id} className="flex items-center justify-between p-4 bg-secondary/10 rounded-xl border border-border/50 hover:bg-secondary/20 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                        <DollarSign size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">Invoice #{comm.invoice.invoiceNumber}</p>
                                                        <p className="text-xs text-muted-foreground">{new Date(comm.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="font-bold text-emerald-500">
                                                    +{formatPrice(comm.commissionAmount)}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-muted-foreground">
                                            <p>No recent activity found.</p>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-6 text-center">
                                    <Button variant="link" asChild className="text-primary font-bold">
                                        <Link href="/investor/commissions">View All Transactions &rarr;</Link>
                                    </Button>
                                </div>
                            </motion.div>

                            {/* Quick Actions / Info */}
                            <div className="space-y-8">
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-card border border-border rounded-2xl p-8 space-y-6 shadow-sm"
                                >
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Your Plan</h3>
                                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                                        <p className="text-sm text-muted-foreground mb-1">Commission Rate</p>
                                        <p className="text-2xl font-bold text-primary">
                                            {stats?.commissionType === 'PERCENTAGE'
                                                ? `${stats?.commissionValue}%`
                                                : formatPrice(stats?.commissionValue || 0)
                                            }
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Earned on every paid invoice.
                                        </p>
                                    </div>
                                    <Button asChild className="w-full h-12 rounded-xl font-bold border-2 border-primary/20 hover:bg-primary/5 bg-transparent text-primary">
                                        <Link href="/investor/commissions">Full Report</Link>
                                    </Button>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
