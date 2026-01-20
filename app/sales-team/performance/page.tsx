"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Trophy,
    Medal,
    Target,
    TrendingUp,
    BarChart3,
    Users,
    ChevronRight,
    Loader2,
    ShieldAlert
} from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/store/authStore";
import { Badge } from "@/components/shared/Badge";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
    id: number;
    userId: number;
    totalPoints: string;
    availablePoints: string;
    totalConversions: number;
    totalProspects: number;
    conversionRate: string;
    user: {
        firstName: string;
        lastName: string;
        email: string;
    };
}

export default function PerformancePage() {
    const { user } = useAuthStore();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await api.get('/sales-team/analytics/leaderboard');
                setLeaderboard(res.data.data);
            } catch (err) {
                console.error("Failed to fetch leaderboard", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary/20" />
            </div>
        );
    }

    const myRank = leaderboard.findIndex(entry => entry.userId === user?.id) + 1;
    const myStats = leaderboard.find(entry => entry.userId === user?.id);

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest mb-2">
                        <span className="w-6 h-[1.5px] bg-primary"></span>
                        Analytics
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Performance Ranking</h1>
                    <p className="text-gray-500 font-medium text-sm mt-1">See how you stack up against the best in the team.</p>
                </motion.div>

                {myRank > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-center gap-4"
                    >
                        <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <Trophy size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Global Rank</p>
                            <h3 className="text-2xl font-black text-gray-900">#{myRank}</h3>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Top 3 Highflyers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {leaderboard.slice(0, 3).map((entry, idx) => (
                    <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={cn(
                            "relative overflow-hidden p-6 rounded-[2rem] border transition-all",
                            idx === 0
                                ? "bg-white border-primary/20 shadow-2xl shadow-primary/10 ring-4 ring-primary/5"
                                : "bg-white border-gray-100 shadow-sm"
                        )}
                    >
                        {idx === 0 && <div className="absolute top-0 right-0 p-4"><Medal size={32} className="text-primary opacity-20" /></div>}

                        <div className="flex items-center gap-4 mb-6">
                            <div className={cn(
                                "h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner",
                                idx === 0 ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
                            )}>
                                {idx + 1}
                            </div>
                            <div>
                                <h4 className="font-black text-gray-900 text-lg leading-tight">{entry.user.firstName} {entry.user.lastName}</h4>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-tighter">Elite Member</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50/50 p-4 rounded-2xl">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Points</p>
                                <p className="font-black text-gray-900 text-lg">{parseFloat(entry.totalPoints).toFixed(0)}</p>
                            </div>
                            <div className="bg-gray-50/50 p-4 rounded-2xl">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Sales</p>
                                <p className="font-black text-gray-900 text-lg">{entry.totalConversions}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Detailed Leaderboard */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden"
            >
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Team Standings</h3>
                        <p className="text-gray-400 font-medium text-xs">Dynamic performance tracking</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#fafafa] text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            <tr>
                                <th className="px-8 py-5">Rank</th>
                                <th className="px-8 py-5">Member</th>
                                <th className="px-8 py-5 text-center">Prospects</th>
                                <th className="px-8 py-5 text-center">Conversions</th>
                                <th className="px-8 py-5 text-right">Points</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {leaderboard.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-12 text-center text-gray-400 font-medium italic">
                                        No ranking data available yet.
                                    </td>
                                </tr>
                            ) : (
                                leaderboard.map((entry, idx) => (
                                    <tr
                                        key={entry.id}
                                        className={cn(
                                            "group transition-colors",
                                            entry.userId === user?.id ? "bg-primary/[0.03]" : "hover:bg-gray-50/50"
                                        )}
                                    >
                                        <td className="px-8 py-5">
                                            <div className={cn(
                                                "h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm",
                                                idx === 0 ? "bg-primary/10 text-primary" :
                                                    idx === 1 ? "bg-amber-100 text-amber-600" :
                                                        idx === 2 ? "bg-slate-100 text-slate-500" :
                                                            "text-gray-400"
                                            )}>
                                                {idx + 1}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center font-black text-gray-400 text-xs">
                                                    {entry.user.firstName[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{entry.user.firstName} {entry.user.lastName}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 truncate max-w-[150px]">{entry.user.email}</p>
                                                </div>
                                                {entry.userId === user?.id && (
                                                    <Badge variant="info" className="text-[8px] uppercase tracking-widest font-black py-0.5 px-2">You</Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className="font-bold text-gray-600 text-sm">{entry.totalProspects}</span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className="font-bold text-emerald-600 text-sm">{entry.totalConversions}</span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <span className="font-black text-gray-900 text-sm">{parseFloat(entry.totalPoints).toLocaleString()} pts</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
