"use client";

import React, { useState, useEffect } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useLanguage } from "@/components/language-provider";
import {
    TrendingUp,
    Users,
    CreditCard,
    Ticket,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    DollarSign,
    Loader2,
    RefreshCw,
    Search,
    Zap,
    HeartPulse,
    Plus
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Skeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from "recharts";
import { motion } from "framer-motion";
import { cn, formatPrice, getCurrencySymbol } from "@/lib/utils";
import api from "@/lib/api";
import { useSettingsStore } from "@/lib/store/settingsStore";

const MetricCard = ({ title, value, change, icon: Icon, trend, loading }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 group"
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
                <Skeleton className="h-8 w-24 mt-1" />
            ) : (
                <h3 className="text-2xl font-bold mt-1 tracking-tight">{value}</h3>
            )}
        </div>
    </motion.div>
);

export default function AdminDashboard() {
    const { t } = useLanguage();
    const [mounted, setMounted] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [clientStats, setClientStats] = useState<any[]>([]);
    const [activityLogs, setActivityLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [runningCron, setRunningCron] = useState(false);

    const { settings, fetchSettings } = useSettingsStore();
    const currency = settings.defaultCurrency || 'BDT';
    const currencySymbol = getCurrencySymbol(currency);

    useEffect(() => {
        setMounted(true);
        fetchSettings();
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, revenueRes, clientRes, logsRes] = await Promise.all([
                api.get("/reports/dashboard"),
                api.get("/reports/monthly-revenue"),
                api.get("/reports/clients"),
                api.get("/system/logs")
            ]);

            setStats(statsRes.data.data.stats);
            setRevenueData(revenueRes.data.data.chartData || []);

            // Map client stats to colors
            const statusColors: any = {
                ACTIVE: "#10b981",
                PENDING: "#f59e0b",
                BANNED: "#ef4444"
            };

            const clientsByStatus = clientRes.data.data.clientsByStatus || [];
            const totalClients = clientsByStatus.reduce((acc: number, curr: any) => acc + (curr._count?.id || 0), 0);

            setClientStats(clientsByStatus.map((c: any) => ({
                name: c.status,
                value: c._count.id,
                percentage: totalClients > 0 ? Math.round((c._count.id / totalClients) * 100) : 0,
                color: statusColors[c.status] || "#64748b"
            })));

            const logs = logsRes.data.data.logs || [];
            setActivityLogs(logs.slice(0, 4));
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRunCron = async () => {
        if (!confirm("Force run all maintenance tasks? This will process expirations, merge invoices and send notifications.")) return;
        setRunningCron(true);
        try {
            const res = await api.post("/system/run-cron");
            toast.success(res.data.message);
            fetchDashboardData();
        } catch (error) {
            toast.error("Failed to execute maintenance cycle");
        } finally {
            setRunningCron(false);
        }
    };

    if (!mounted) return null;

    return (
        <AuthGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
                <Navbar />
                <Sidebar />
                <main className="lg:pl-72 pt-20 p-4 md:p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Header */}
                        <div className="flex flex-col gap-1">
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                                Command <span className="text-primary">Center</span>
                            </h1>
                            <p className="text-muted-foreground text-sm md:text-base font-medium">
                                Operational Intelligence & System Overview
                            </p>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <MetricCard
                                title="Net Revenue"
                                value={formatPrice(Number(stats?.totalRevenue?._sum?.amountPaid || 0) - Number(stats?.payouts?.total || 0), currency)}
                                change={stats?.payouts?.total > 0 ? `-${formatPrice(stats.payouts.total, currency)} payouts` : "+12.5%"}
                                icon={DollarSign}
                                trend={stats?.payouts?.total > 0 ? "down" : "up"}
                                loading={loading}
                            />
                            <MetricCard
                                title="Active Services"
                                value={stats?.activeServices || '0'}
                                change="+8.2%"
                                icon={Users}
                                trend="up"
                                loading={loading}
                            />
                            <MetricCard
                                title="Pending Orders"
                                value={stats?.pendingOrders || '0'}
                                change="-5.4%"
                                icon={CreditCard}
                                trend="down"
                                loading={loading}
                            />
                            <MetricCard
                                title="Open Tickets"
                                value={stats?.pendingTickets || '0'}
                                change="+2.1%"
                                icon={Ticket}
                                trend="up"
                                loading={loading}
                            />
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Revenue Growth */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 md:p-10 shadow-sm"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-xl font-bold">Revenue Growth</h3>
                                        <p className="text-sm text-muted-foreground">Monthly Performance</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1 text-xs font-medium rounded-lg bg-primary/10 text-primary border border-primary/20">Monthly</button>
                                        <button className="px-3 py-1 text-xs font-medium rounded-lg text-muted-foreground hover:bg-muted transition-colors" onClick={fetchDashboardData}>
                                            <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
                                        </button>
                                    </div>
                                </div>
                                <div className="h-[350px] w-full">
                                    {loading ? (
                                        <div className="flex flex-col gap-4 h-full">
                                            <div className="flex gap-4 items-end h-full">
                                                {[...Array(6)].map((_, i) => (
                                                    <Skeleton key={i} className="flex-1" style={{ height: `${Math.random() * 60 + 20}%` }} />
                                                ))}
                                            </div>
                                            <div className="flex justify-between">
                                                <Skeleton className="h-3 w-16" />
                                                <Skeleton className="h-3 w-16" />
                                                <Skeleton className="h-3 w-16" />
                                            </div>
                                        </div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={revenueData}>
                                                <defs>
                                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                                <XAxis
                                                    dataKey="name"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: "#64748b", fontSize: 12 }}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: "#64748b", fontSize: 12 }}
                                                    tickFormatter={(value) => `${currencySymbol}${value}`}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: "#0f172a",
                                                        borderColor: "#1e293b",
                                                        color: "#f8fafc",
                                                        borderRadius: "12px",
                                                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                                                    }}
                                                    formatter={(value: any, name: string | any) => {
                                                        if (name === "revenue") return [`${currencySymbol}${value}`, "Net Revenue"];
                                                        if (name === "gross") return [`${currencySymbol}${value}`, "Gross Revenue"];
                                                        if (name === "payouts") return [`${currencySymbol}${value}`, "Total Payouts"];
                                                        return [value, name];
                                                    }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="revenue"
                                                    stroke="#3b82f6"
                                                    strokeWidth={3}
                                                    fillOpacity={1}
                                                    fill="url(#colorRevenue)"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </motion.div>

                            {/* Client Status */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-card border border-border rounded-2xl p-6 md:p-10 shadow-sm"
                            >
                                <h3 className="text-xl font-bold mb-1">Client Distribution</h3>
                                <p className="text-sm text-muted-foreground mb-8">Client Segments</p>
                                <div className="h-[250px] w-full relative">
                                    {loading ? (
                                        <div className="flex items-center justify-center h-full">
                                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                        </div>
                                    ) : (
                                        <>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={clientStats}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {clientStats.map((entry: any, index: number) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: "#0f172a",
                                                            borderColor: "#1e293b",
                                                            borderRadius: "12px"
                                                        }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <span className="text-3xl font-bold">{clientStats.reduce((acc, curr) => acc + curr.value, 0)}</span>
                                                <span className="text-xs text-muted-foreground">Total</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="mt-8 space-y-4">
                                    {clientStats.map((item: any, iValue: number) => (
                                        <div key={iValue} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                                <span className="text-sm font-medium">{item.name}</span>
                                            </div>
                                            <span className="text-sm text-muted-foreground font-semibold">
                                                {item.percentage}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Recent Activity or Tasks */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <Activity className="text-primary" size={20} />
                                        System Activity
                                    </h3>
                                    <button className="text-xs text-primary font-medium hover:underline">View All</button>
                                </div>
                                <div className="space-y-6">
                                    {loading ? (
                                        [...Array(4)].map((_, i) => (
                                            <div key={i} className="flex gap-4">
                                                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex justify-between">
                                                        <Skeleton className="h-4 w-1/4" />
                                                        <Skeleton className="h-3 w-1/6" />
                                                    </div>
                                                    <Skeleton className="h-3 w-3/4" />
                                                </div>
                                            </div>
                                        ))
                                    ) : activityLogs.length > 0 ? (
                                        activityLogs.map((item: any, iLog: number) => (
                                            <div key={iLog} className="flex gap-4 group">
                                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                                    <Activity size={18} />
                                                </div>
                                                <div className="flex-1 border-b border-border/50 pb-4">
                                                    <div className="flex justify-between items-start">
                                                        <p className="text-sm font-semibold">{item.user?.firstName} {item.user?.lastName}</p>
                                                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{new Date(item.timestamp).toLocaleTimeString()}</span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-0.5">{item.activity}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <EmptyState
                                            icon={Activity}
                                            title="No recent activity"
                                            description="System is operational and quiet. No logs found for the current period."
                                        />
                                    )}
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold">Quick Actions</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { name: "Add Client", color: "bg-blue-500/10 text-blue-500", icon: Users, href: "/admin/clients/add" },
                                        { name: "Create Invoice", color: "bg-emerald-500/10 text-emerald-500", icon: CreditCard, href: "/admin/billing/create" },
                                        { name: t("new_ticket"), color: "bg-amber-500/10 text-amber-500", icon: Ticket, href: "/admin/support/new" },
                                        { name: t("system_config"), color: "bg-purple-500/10 text-purple-500", icon: Activity, href: "/admin/settings" },
                                    ].map((item, iAction: number) => (
                                        <Link
                                            key={iAction}
                                            href={item.href}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-6 rounded-2xl border border-transparent hover:border-border transition-all duration-300 gap-3 group",
                                                item.color
                                            )}
                                        >
                                            <item.icon size={28} className="group-hover:scale-110 transition-transform" />
                                            <span className="text-sm font-bold">{item.name}</span>
                                        </Link>
                                    ))}
                                    <button
                                        onClick={handleRunCron}
                                        disabled={runningCron}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-6 rounded-2xl border border-transparent hover:border-border transition-all duration-300 gap-3 group col-span-2",
                                            "bg-primary/10 text-primary border-primary/20 shadow-lg shadow-primary/5"
                                        )}
                                    >
                                        {runningCron ? (
                                            <Loader2 className="w-7 h-7 animate-spin" />
                                        ) : (
                                            <HeartPulse size={28} className="group-hover:scale-110 transition-transform" />
                                        )}
                                        <span className="text-sm font-bold tracking-tight">Run Maintenance Cycle</span>
                                    </button>
                                </div>
                                <div className="mt-8 p-6 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl border border-primary/20">
                                    <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Notice Board</h4>
                                    <p className="text-sm text-foreground leading-relaxed font-medium">
                                        Maintenance notice
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
