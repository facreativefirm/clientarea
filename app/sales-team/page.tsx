"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import api from "@/lib/api";
import {
    Loader2,
    Users,
    DollarSign,
    TrendingUp,
    AlertCircle,
    BarChart,
    Plus,
    ArrowUpRight,
    Trophy,
    Gamepad2,
    Target
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { Button } from "@/components/ui/button";

interface Stats {
    totalPoints: string;
    availablePoints: string;
    totalProspects: number;
    totalConversions: number;
    conversionRate: string;
}

const StatCard = ({ title, value, icon: Icon, colorCls, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.3 }}
        className="bg-card border border-border rounded-xl p-5 shadow-sm group hover:border-primary/20 transition-all font-sans"
    >
        <div className="flex justify-between items-start mb-4 font-sans">
            <div className={`p-3 rounded-lg ${colorCls} group-hover:scale-105 transition-transform`}>
                <Icon size={20} />
            </div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Live</div>
        </div>
        <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 font-sans">{title}</p>
            <h3 className="text-2xl font-black text-foreground tracking-tight font-sans">{value}</h3>
        </div>
    </motion.div>
);

export default function SalesTeamDashboard() {
    const { user } = useAuthStore();
    const { formatPrice } = useSettingsStore();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/sales-team/stats/me');
                setStats(res.data.data);
            } catch (err: any) {
                console.error("Failed to fetch dashboard stats", err);
                if (err.response?.status === 404) {
                    setError("You are not registered as a Sales Team Member.");
                } else {
                    setError("Failed to load dashboard data.");
                }
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchStats();
        }
    }, [user]);

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

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card border border-rose-500/20 rounded-2xl p-10 text-center max-w-lg mx-auto shadow-sm mt-12 font-sans"
            >
                <div className="w-16 h-16 bg-rose-500/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="h-8 w-8 text-rose-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2 tracking-tight">Access Restricted</h3>
                <p className="text-muted-foreground font-medium mb-6">{error}</p>
                <Button className="rounded-xl h-11 px-6 font-bold bg-primary text-white">
                    Contact Administrator
                </Button>
            </motion.div>
        );
    }

    return (
        <div className="space-y-12 pb-20">
            {/* Top Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest mb-2">
                        <span className="w-6 h-[1.5px] bg-primary"></span>
                        Overview
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight mb-2 font-sans">
                        Hello, {user?.firstName}
                    </h1>
                    <p className="text-muted-foreground font-medium text-sm max-w-sm font-sans">
                        Keep track of your prospects and earnings.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-wrap gap-3"
                >
                    <Link href="/sales-team/points">
                        <Button variant="outline" className="h-11 px-5 rounded-xl font-bold border-border bg-background hover:bg-muted shadow-sm gap-2 font-sans text-foreground">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            Withdraw
                        </Button>
                    </Link>
                    <Link href="/sales-team/prospects/new">
                        <Button className="h-11 px-5 rounded-xl font-bold bg-[#f37021] text-white shadow-sm hover:bg-[#d9621c] transition-all gap-2 border-none font-sans">
                            <Plus className="w-5 h-5" />
                            Add Prospect
                        </Button>
                    </Link>
                </motion.div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                <StatCard
                    title="Available Balance"
                    value={stats?.availablePoints || "0"}
                    icon={Trophy}
                    colorCls="bg-amber-100 text-amber-600"
                    delay={0.1}
                />
                <StatCard
                    title="Total Prospects"
                    value={stats?.totalProspects || "0"}
                    icon={Target}
                    colorCls="bg-blue-100 text-blue-600"
                    delay={0.2}
                />
                <StatCard
                    title="Active Conversions"
                    value={stats?.totalConversions || "0"}
                    icon={TrendingUp}
                    colorCls="bg-emerald-100 text-emerald-600"
                    delay={0.3}
                />
                <StatCard
                    title="Conversion Rate"
                    value={`${stats?.conversionRate || "0"}%`}
                    icon={BarChart}
                    colorCls="bg-purple-100 text-purple-600"
                    delay={0.4}
                />
            </div>

            {/* Recent Activity Box */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
            >
                <div className="p-6 md:p-8 border-b border-border flex items-center justify-between font-sans">
                    <div>
                        <h3 className="text-xl font-bold text-foreground tracking-tight">Recent Activity</h3>
                        <p className="text-muted-foreground font-medium text-xs">Your latest point updates</p>
                    </div>
                    <Link href="/sales-team/points">
                        <Button variant="ghost" className="rounded-lg font-bold text-primary group font-sans text-sm h-9">
                            View All
                            <ArrowUpRight className="ml-1 w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Button>
                    </Link>
                </div>
                <div className="p-10 text-center py-16">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-gray-300">
                        <Gamepad2 size={24} />
                    </div>
                    <p className="text-gray-400 font-medium text-sm">Transaction history will appear here once you start earning points.</p>
                </div>
            </motion.div>
        </div>
    );
}
