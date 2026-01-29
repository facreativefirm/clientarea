"use client";

import React, { useState, useEffect } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import api from "@/lib/api";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, Wallet, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function InvestorPayouts() {
    const { formatPrice } = useSettingsStore();
    const [payouts, setPayouts] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("bKash");
    const [details, setDetails] = useState("");
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, payoutsRes] = await Promise.all([
                api.get("/investor/stats"),
                api.get("/investor/payouts")
            ]);
            setStats(statsRes.data);
            setPayouts(payoutsRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setSubmitting(true);
        try {
            await api.post("/investor/payouts", { amount, method, details });
            setMessage({ type: 'success', text: 'Payout request submitted successfully.' });
            setAmount("");
            setDetails("");
            fetchData(); // Refresh list
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to submit request.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthGuard allowedRoles={["INVESTOR"]}>
            <div className="min-h-screen bg-background text-foreground">
                <Navbar />
                <Sidebar />
                <main className="lg:pl-75 pt-20 p-4 md:p-8">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" asChild>
                                <Link href="/investor"><ArrowLeft size={20} /></Link>
                            </Button>
                            <h1 className="text-2xl font-bold">Withdrawals & Payouts</h1>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Left: Request Form */}
                            <div className="md:col-span-1 space-y-6">
                                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-primary/10 rounded-lg text-primary">
                                            <Wallet size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Available Balance</p>
                                            <h3 className="text-2xl font-bold">{stats ? formatPrice(stats.walletBalance) : "..."}</h3>
                                        </div>
                                    </div>

                                    <form onSubmit={handleRequest} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Withdrawal Amount</Label>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                min="10"
                                                step="0.01"
                                                required
                                            />
                                            <p className="text-xs text-muted-foreground">Minimum withdrawal: $10.00</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Payment Method</Label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={method}
                                                onChange={(e) => setMethod(e.target.value)}
                                            >
                                                <option>bKash</option>
                                                <option>Nagad</option>
                                                <option>Bank Transfer</option>
                                                <option>Rocket</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Payment Details</Label>
                                            <Textarea
                                                placeholder="Enter Bank Account / Wallet Address..."
                                                value={details}
                                                onChange={(e) => setDetails(e.target.value)}
                                                required
                                                className="min-h-[100px]"
                                            />
                                        </div>

                                        {message && (
                                            <Alert variant={message.type === 'error' ? "destructive" : "default"} className={message.type === 'success' ? "border-emerald-500/50 text-emerald-500 bg-emerald-500/10" : ""}>
                                                <AlertTitle>{message.type === 'success' ? "Success" : "Error"}</AlertTitle>
                                                <AlertDescription>{message.text}</AlertDescription>
                                            </Alert>
                                        )}

                                        <Button type="submit" className="w-full font-bold" disabled={submitting}>
                                            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Request Payout"}
                                        </Button>
                                    </form>
                                </div>
                            </div>

                            {/* Right: History */}
                            <div className="md:col-span-2">
                                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                                    <div className="p-4 border-b border-border bg-secondary/10">
                                        <h3 className="font-bold">Payout History</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-secondary/30 text-muted-foreground uppercase text-xs font-bold">
                                                <tr>
                                                    <th className="px-6 py-4">Date</th>
                                                    <th className="px-6 py-4">Amount</th>
                                                    <th className="px-6 py-4">Method</th>
                                                    <th className="px-6 py-4 text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/50">
                                                {loading ? (
                                                    <tr>
                                                        <td colSpan={4} className="p-8 text-center">
                                                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                                                        </td>
                                                    </tr>
                                                ) : payouts.length > 0 ? (
                                                    payouts.map((payout) => (
                                                        <tr key={payout.id} className="hover:bg-secondary/5 transition-colors">
                                                            <td className="px-6 py-4 font-medium">
                                                                {new Date(payout.createdAt).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-6 py-4 font-bold">
                                                                {formatPrice(payout.amount)}
                                                            </td>
                                                            <td className="px-6 py-4 text-muted-foreground">
                                                                {payout.method}
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className={cn(
                                                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                                                    payout.status === 'PAID' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                                                        payout.status === 'PENDING' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                                            "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                                                )}>
                                                                    {payout.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                                            No payouts requested yet.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
