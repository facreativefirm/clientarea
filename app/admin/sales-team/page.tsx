"use client";

import React, { useState, useEffect } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import {
    Users,
    TrendingUp,
    MapPin,
    DollarSign,
    Trophy,
    Activity,
    ArrowUpRight,
    Loader2,
    Plus,
    Search as SearchIcon,
    X,
    Briefcase
} from "lucide-react";
import { motion } from "framer-motion";
// MetricCard import removed to fix lint error - local DashboardMetricCard is used instead
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";
import api from "@/lib/api";
import { Badge } from "@/components/shared/Badge";
import { Skeleton } from "@/components/shared/Skeleton";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Re-implementing MetricCard locally if not shared, to ensure matching style
const DashboardMetricCard = ({ title, value, change, icon: Icon, loading, colorCls }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 group"
    >
        <div className="flex justify-between items-start mb-4">
            <div className={cn("p-3 rounded-xl transition-colors", colorCls || "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground")}>
                <Icon size={24} />
            </div>
            {change && (
                <div className="flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
                    <ArrowUpRight size={16} />
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

export default function SalesTeamAdminOverview() {
    const [loading, setLoading] = useState(true);
    const [territoryStats, setTerritoryStats] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [overview, setOverview] = useState({
        totalPoints: 0,
        totalProspects: 0,
        totalConversions: 0,
        activeMembers: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [terrRes, leadRes] = await Promise.all([
                api.get('/sales-team/analytics/territory-performance'),
                api.get('/sales-team/analytics/leaderboard')
            ]);

            const territories = terrRes.data.data || [];
            setTerritoryStats(territories);
            setLeaderboard(leadRes.data.data || []);

            // Aggregate totals from territory data for overview
            const totals = territories.reduce((acc: any, curr: any) => ({
                totalPoints: acc.totalPoints + (curr._sum.totalPoints || 0),
                totalProspects: acc.totalProspects + (curr._sum.totalProspects || 0),
                totalConversions: acc.totalConversions + (curr._sum.totalConversions || 0),
                activeMembers: acc.activeMembers + (curr._count.id || 0)
            }), { totalPoints: 0, totalProspects: 0, totalConversions: 0, activeMembers: 0 });

            setOverview(totals);

        } catch (err) {
            console.error("Failed to load sales team data", err);
        } finally {
            setLoading(false);
        }
    };

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [userSearchText, setUserSearchText] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [regForm, setRegForm] = useState({
        employeeId: "",
        territory: "",
        department: ""
    });
    const [isRegistering, setIsRegistering] = useState(false);

    useEffect(() => {
        if (isDialogOpen) {
            fetchUsers("");
        }
    }, [isDialogOpen]);

    const fetchUsers = async (query: string) => {
        try {
            // Assuming /users allows basic filtering or listing
            const res = await api.get(`/users?search=${query}`);
            // Filter out existing sales members by type or logic if needed, 
            // but for now just show all for selection
            setUsers(res.data.data.users || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleRegister = async () => {
        if (!selectedUser) {
            toast.error("Please select a user");
            return;
        }
        if (!regForm.territory) {
            toast.error("Territory is required");
            return;
        }

        try {
            setIsRegistering(true);
            await api.post('/sales-team/members', {
                userId: selectedUser.id,
                employeeId: regForm.employeeId,
                territory: regForm.territory,
                department: regForm.department
            });
            toast.success("Sales member registered successfully");
            setIsDialogOpen(false);
            setSelectedUser(null);
            setRegForm({ employeeId: "", territory: "", department: "" });
            fetchData(); // Refresh overview counts
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Registration failed");
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <AuthGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
                <Navbar />
                <Sidebar />
                <main className="lg:pl-72 pt-20 p-4 md:p-8">
                    <div className="max-w-7xl mx-auto space-y-8">

                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                                    Sales Team <span className="text-primary">Overview</span>
                                </h1>
                                <p className="text-muted-foreground text-sm md:text-base font-medium">
                                    Performance analytics and territory management
                                </p>
                            </div>

                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="h-12 px-6 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md gap-2">
                                        <Plus className="w-5 h-5" />
                                        Register New Member
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px] border-border bg-card">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-bold">Register Sales Member</DialogTitle>
                                        <DialogDescription className="text-muted-foreground font-medium">
                                            Assign a user to the sales team and define their territory.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-6 py-4">
                                        {/* User Selection */}
                                        <div className="space-y-4">
                                            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Select User</Label>
                                            {!selectedUser ? (
                                                <div className="space-y-4">
                                                    <div className="relative">
                                                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                                        <Input
                                                            placeholder="Search user by name or email..."
                                                            className="pl-10 h-10 bg-secondary/20 border-border"
                                                            value={userSearchText}
                                                            onChange={(e) => {
                                                                setUserSearchText(e.target.value);
                                                                fetchUsers(e.target.value);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="max-h-[200px] overflow-y-auto border border-border rounded-xl space-y-1 p-2 bg-secondary/10">
                                                        {users.length === 0 ? (
                                                            <p className="text-center py-4 text-xs text-muted-foreground">No users found</p>
                                                        ) : (
                                                            users.map(user => (
                                                                <button
                                                                    key={user.id}
                                                                    onClick={() => setSelectedUser(user)}
                                                                    className="w-full text-left p-3 rounded-lg hover:bg-primary/10 transition-colors flex items-center justify-between group"
                                                                >
                                                                    <div>
                                                                        <p className="font-bold text-sm group-hover:text-primary transition-colors">{user.firstName} {user.lastName}</p>
                                                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                                                    </div>
                                                                    <Badge variant="outline" className="text-[10px]">{user.userType}</Badge>
                                                                </button>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                                                            {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm tracking-tight">{selectedUser.firstName} {selectedUser.lastName}</p>
                                                            <p className="text-xs text-muted-foreground font-medium">{selectedUser.email}</p>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="icon" onClick={() => setSelectedUser(null)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="empId" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Employee ID</Label>
                                                <Input
                                                    id="empId"
                                                    placeholder="SALES-001"
                                                    className="h-10 bg-secondary/20 border-border"
                                                    value={regForm.employeeId}
                                                    onChange={(e) => setRegForm(prev => ({ ...prev, employeeId: e.target.value }))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="dept" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Department</Label>
                                                <Input
                                                    id="dept"
                                                    placeholder="Enterprise Sales"
                                                    className="h-10 bg-secondary/20 border-border"
                                                    value={regForm.department}
                                                    onChange={(e) => setRegForm(prev => ({ ...prev, department: e.target.value }))}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="territory" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Territory / Region</Label>
                                            <Input
                                                id="territory"
                                                placeholder="e.g. Dhaka North, Manhattan, etc."
                                                className="h-12 bg-secondary/20 border-border text-base font-medium"
                                                value={regForm.territory}
                                                onChange={(e) => setRegForm(prev => ({ ...prev, territory: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    <DialogFooter className="gap-2 sm:gap-0">
                                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-12 px-6 font-bold border-border">
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleRegister}
                                            disabled={isRegistering || !selectedUser || !regForm.territory}
                                            className="rounded-xl h-12 px-8 font-bold bg-primary shadow-lg shadow-primary/20 min-w-[140px]"
                                        >
                                            {isRegistering ? <Loader2 className="w-4 h-4 animate-spin" /> : "Register Member"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <DashboardMetricCard
                                title="Total Prospects"
                                value={overview.totalProspects}
                                change="+12%"
                                icon={Users}
                                loading={loading}
                                colorCls="bg-blue-500/10 text-blue-500"
                            />
                            <DashboardMetricCard
                                title="Conversions"
                                value={overview.totalConversions}
                                change="+5%"
                                icon={TrendingUp}
                                loading={loading}
                                colorCls="bg-emerald-500/10 text-emerald-500"
                            />
                            <DashboardMetricCard
                                title="Points Awarded"
                                value={overview.totalPoints.toLocaleString()}
                                change="+8%"
                                icon={Trophy}
                                loading={loading}
                                colorCls="bg-amber-500/10 text-amber-500"
                            />
                            <DashboardMetricCard
                                title="Active Members"
                                value={overview.activeMembers}
                                icon={MapPin}
                                loading={loading}
                                colorCls="bg-purple-500/10 text-purple-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Territory Performance Chart */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 md:p-10 shadow-sm"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-xl font-bold">Territory Performance</h3>
                                        <p className="text-sm text-muted-foreground">Prospects vs Conversions by Region</p>
                                    </div>
                                </div>
                                <div className="h-[350px] w-full">
                                    {loading ? (
                                        <div className="flex items-center justify-center h-full">
                                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                        </div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={territoryStats}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                                <XAxis dataKey="territory" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: "#0f172a",
                                                        borderColor: "#1e293b",
                                                        color: "#f8fafc",
                                                        borderRadius: "12px"
                                                    }}
                                                />
                                                <Bar dataKey="_sum.totalProspects" name="Prospects" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="_sum.totalConversions" name="Conversions" fill="#10b981" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </motion.div>

                            {/* Leaderboard */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm"
                            >
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Trophy className="text-amber-500" size={20} />
                                    Top Performers
                                </h3>
                                <div className="space-y-6">
                                    {loading ? (
                                        [1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
                                    ) : (
                                        leaderboard.map((member, idx) => (
                                            <div key={member.id} className="flex items-center gap-4 group">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                                                    idx === 0 ? "bg-amber-500/20 text-amber-500" :
                                                        idx === 1 ? "bg-slate-400/20 text-slate-400" :
                                                            idx === 2 ? "bg-orange-700/20 text-orange-700" : "bg-card text-muted-foreground"
                                                )}>
                                                    #{idx + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-sm">{member.user?.firstName} {member.user?.lastName}</p>
                                                    <p className="text-xs text-muted-foreground">{member.territory}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="block font-bold text-primary">{member.totalPoints} pts</span>
                                                    <span className="text-xs text-muted-foreground">{member.totalConversions} sales</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>

                        </div>
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
