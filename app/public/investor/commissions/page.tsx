"use client";

import React, { useState, useEffect } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import api from "@/lib/api";
import { formatPrice } from "@/lib/utils"; // Assuming utility exists or use store
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, DollarSign } from "lucide-react";
import Link from "next/link";
import { useSettingsStore } from "@/lib/store/settingsStore";

export default function InvestorCommissions() {
    const { formatPrice } = useSettingsStore();
    const [commissions, setCommissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchCommissions();
    }, [page]);

    const fetchCommissions = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/investor/commissions?page=${page}&limit=15`);
            setCommissions(data.commissions);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthGuard allowedRoles={["INVESTOR"]}>
            <div className="min-h-screen bg-background text-foreground">
                <Navbar />
                <Sidebar />
                <main className="lg:pl-75 pt-20 p-4 md:p-8">
                    <div className="max-w-5xl mx-auto space-y-8">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" asChild>
                                <Link href="/investor"><ArrowLeft size={20} /></Link>
                            </Button>
                            <h1 className="text-2xl font-bold">Commission History</h1>
                        </div>

                        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-secondary/30 text-muted-foreground uppercase text-xs font-bold">
                                        <tr>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Invoice</th>
                                            <th className="px-6 py-4">Invoice Amount</th>
                                            <th className="px-6 py-4 text-right">Commission</th>
                                            <th className="px-6 py-4 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center">
                                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                                                </td>
                                            </tr>
                                        ) : commissions.length > 0 ? (
                                            commissions.map((comm) => (
                                                <tr key={comm.id} className="hover:bg-secondary/5 transition-colors">
                                                    <td className="px-6 py-4 font-medium">
                                                        {new Date(comm.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        #{comm.invoice.invoiceNumber}
                                                    </td>
                                                    <td className="px-6 py-4 text-muted-foreground">
                                                        {formatPrice(comm.invoiceAmount)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-bold text-emerald-500">
                                                        +{formatPrice(comm.commissionAmount)}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                                                            {comm.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                                    No commissions found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-center gap-2">
                            <Button
                                variant="outline"
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                Previous
                            </Button>
                            <span className="flex items-center px-4 text-sm font-medium">
                                Page {page} of {totalPages || 1}
                            </span>
                            <Button
                                variant="outline"
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
