"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useLanguage } from "@/components/language-provider";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/ui/button";
import {
    Search,
    CheckCircle2,
    XCircle,
    Clock,
    DollarSign,
    ArrowLeft,
    Loader2,
    ExternalLink,
    Banknote,
    History
} from "lucide-react";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import Link from "next/link";
import { toast } from "sonner";
import { useSettingsStore } from "@/lib/store/settingsStore";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";

export default function AdminPayoutsPage() {
    const { t } = useLanguage();
    const { formatPrice } = useSettingsStore();
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Processing State
    const [selectedPayout, setSelectedPayout] = useState<any>(null);
    const [isProcessOpen, setIsProcessOpen] = useState(false);
    const [transactionId, setTransactionId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchPayouts();
    }, []);

    const fetchPayouts = async () => {
        try {
            setLoading(true);
            const response = await api.get("/reseller/all-payouts");
            setPayouts(response.data.data.payouts || []);
        } catch (err: any) {
            toast.error("Failed to load payout requests");
        } finally {
            setLoading(false);
        }
    };

    const handleProcessPayout = async (status: 'COMPLETED' | 'FAILED') => {
        if (status === 'COMPLETED' && !transactionId) {
            toast.error("Please provide a transaction reference for completed payouts");
            return;
        }

        try {
            setIsSubmitting(true);
            await api.post("/reseller/process-payout", {
                payoutId: selectedPayout.id,
                status,
                transactionId: status === 'COMPLETED' ? transactionId : null
            });

            toast.success(`Payout ${status.toLowerCase()} matched successfully.`);
            setIsProcessOpen(false);
            setTransactionId("");
            fetchPayouts();
        } catch (err: any) {
            toast.error("Failed to update payout status");
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns = [
        {
            header: "Reseller",
            accessorKey: "reseller" as any,
            cell: (item: any) => (
                <div className="flex flex-col">
                    <span className="font-bold">{item.reseller?.firstName} {item.reseller?.lastName}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-black">{item.reseller?.email}</span>
                </div>
            )
        },
        {
            header: "Requested",
            accessorKey: "createdAt" as any,
            cell: (item: any) => (
                <span className="text-xs font-bold text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                </span>
            )
        },
        {
            header: "Net Amount",
            accessorKey: "netAmount" as any,
            cell: (item: any) => (
                <span className="font-black text-primary text-lg">
                    {formatPrice(Number(item.netAmount))}
                </span>
            )
        },
        {
            header: "Method",
            accessorKey: "method" as any,
            cell: (item: any) => (
                <Badge variant="outline" className="font-black bg-secondary/30">
                    {item.method}
                </Badge>
            )
        },
        {
            header: "Status",
            accessorKey: "status" as any,
            cell: (item: any) => (
                <Badge
                    variant={
                        item.status === 'COMPLETED' ? 'success' :
                            item.status === 'PENDING' ? 'secondary' : 'destructive'
                    }
                    className="font-black uppercase tracking-widest text-[9px]"
                >
                    {item.status}
                </Badge>
            )
        },
        {
            header: "Operations",
            accessorKey: "id" as any,
            cell: (item: any) => (
                item.status === 'PENDING' ? (
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-lg font-black text-[10px] uppercase gap-2 bg-primary/5 border-primary/20 hover:bg-primary hover:text-white transition-all"
                        onClick={() => {
                            setSelectedPayout(item);
                            setIsProcessOpen(true);
                        }}
                    >
                        Process <Banknote size={12} />
                    </Button>
                ) : (
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        Handled {item.transactionId && `(${item.transactionId.slice(0, 8)}...)`}
                    </span>
                )
            )
        }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <Navbar />
            <Sidebar />
            <main className="lg:pl-72 pt-20 p-4 md:p-8 space-y-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild className="rounded-xl border border-border">
                            <Link href="/admin/resellers">
                                <ArrowLeft size={18} />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight">Channel <span className="text-primary">Payouts</span></h1>
                            <p className="text-muted-foreground text-sm font-medium">Verify and approve reseller earnings distributions.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Filter by email or status..."
                                className="pl-12 h-12 bg-secondary/30 border-border rounded-xl font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Syncing Treasury...</p>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <DataTable
                                columns={columns}
                                data={payouts.filter(p =>
                                    p.reseller?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    p.status.toLowerCase().includes(searchTerm.toLowerCase())
                                )}
                            />
                        </div>
                    )}
                </div>

                {/* Processing Dialog */}
                <Dialog open={isProcessOpen} onOpenChange={setIsProcessOpen}>
                    <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] p-8">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black flex items-center gap-3">
                                <History className="text-primary" /> Payout Intelligence
                            </DialogTitle>
                            <DialogDescription className="font-medium pt-2">
                                You are about to authorize a payout of <span className="text-foreground font-bold">{selectedPayout && formatPrice(Number(selectedPayout.netAmount))}</span> to <span className="text-foreground font-bold">{selectedPayout?.reseller?.firstName}</span>.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-6 space-y-4">
                            <div className="p-4 rounded-2xl bg-secondary/30 border border-border space-y-3">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    <span>Method</span>
                                    <span className="text-foreground">{selectedPayout?.method}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    <span>Gateway Charge</span>
                                    <span className="text-rose-500">{formatPrice(Number(selectedPayout?.amount) - Number(selectedPayout?.netAmount))}</span>
                                </div>
                                <div className="flex justify-between text-base font-black text-foreground pt-2 border-t border-border">
                                    <span>Net Distribution</span>
                                    <span className="text-emerald-500">{selectedPayout && formatPrice(Number(selectedPayout.netAmount))}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Transaction Ref / ID (Required for Success)</label>
                                <Input
                                    placeholder="TXN-XXXX-XXXX"
                                    className="h-12 rounded-xl bg-secondary/20 border-border font-bold"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                />
                            </div>
                        </div>

                        <DialogFooter className="sm:justify-between gap-4">
                            <Button
                                variant="outline"
                                className="h-12 rounded-xl border-destructive/20 text-destructive hover:bg-destructive hover:text-white font-bold flex-1"
                                onClick={() => handleProcessPayout('FAILED')}
                                disabled={isSubmitting}
                            >
                                Reject Request
                            </Button>
                            <Button
                                className="h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex-1 shadow-lg shadow-emerald-500/20"
                                onClick={() => handleProcessPayout('COMPLETED')}
                                disabled={isSubmitting || !transactionId}
                            >
                                {isSubmitting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                Confirm Payout
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}
