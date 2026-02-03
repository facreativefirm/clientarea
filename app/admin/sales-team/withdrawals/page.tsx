"use client";

import React, { useState, useEffect } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    Filter,
    MoreHorizontal,
    CheckCircle2,
    XCircle,
    Wallet,
    Calendar,
    Banknote,
    Clock
} from "lucide-react";
import api from "@/lib/api";
import { Skeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminWithdrawalsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingItem, setProcessingItem] = useState<any | null>(null);

    // Process Dialog
    const [dialogOpen, setDialogOpen] = useState(false);
    const [notes, setNotes] = useState("");
    const [txRef, setTxRef] = useState("");
    const [actionType, setActionType] = useState<'APPROVE' | 'PAY' | 'REJECT'>('APPROVE');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get('/sales-team/admin/withdrawals');
            // Mapping backend response to frontend interface
            const mappedRequests = res.data.data.map((r: any) => ({
                id: r.id,
                requestNumber: r.requestNumber,
                memberName: `${r.salesMember?.user?.firstName} ${r.salesMember?.user?.lastName}`,
                amount: r.amountInCurrency, // Or pointsRequested based on UI
                points: r.pointsRequested,
                method: r.paymentMethod,
                details: typeof r.paymentDetails === 'string' ? r.paymentDetails : JSON.stringify(r.paymentDetails),
                status: r.status,
                createdAt: r.createdAt
            }));
            setRequests(mappedRequests);
        } catch (err) {
            console.error("Failed to load withdrawal requests", err);
            setRequests([]); // Set to empty array on error
        } finally {
            setLoading(false);
        }
    };

    const openProcessDialog = (item: any, type: 'APPROVE' | 'PAY' | 'REJECT') => {
        setProcessingItem(item);
        setActionType(type);
        setNotes("");
        setTxRef("");
        setDialogOpen(true);
    };

    const handleProcessSubmit = async () => {
        if (!processingItem) return;

        try {
            let status = 'PROCESSING'; // Default for APPROVE
            if (actionType === 'PAY') status = 'PAID';
            if (actionType === 'REJECT') status = 'REJECTED';

            await api.put(`/sales-team/withdrawals/${processingItem.id}/process`, {
                status,
                notes,
                transactionReference: txRef
            });

            toast.success(`Request ${status.toLowerCase()} successfully`);

            // Update local state
            setRequests(prev => prev.map(r => r.id === processingItem.id ? { ...r, status } : r));
            setDialogOpen(false);

        } catch (err) {
            console.error(err);
            toast.error("Failed to process withdrawal");
        }
    };

    const filteredRequests = requests.filter(r =>
        r.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.memberName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            header: "Request ID",
            accessorKey: "requestNumber",
            cell: (item: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-sm">{item.requestNumber}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
            )
        },
        {
            header: "Member",
            accessorKey: "memberName",
            cell: (item: any) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-xs">
                        {item.memberName.charAt(0)}
                    </div>
                    <span className="font-medium text-sm">{item.memberName}</span>
                </div>
            )
        },
        {
            header: "Amount",
            accessorKey: "amount",
            cell: (item: any) => (
                <div className="font-bold text-primary flex items-center gap-1">
                    <Banknote size={14} />
                    {item.amount}
                </div>
            )
        },
        {
            header: "Method",
            accessorKey: "method",
            cell: (item: any) => (
                <Badge variant="outline" className="text-[10px]">
                    {item.method.replace('_', ' ')}
                </Badge>
            )
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (item: any) => {
                const colors: any = {
                    PENDING: 'secondary',
                    APPROVED: 'info',
                    PROCESSING: 'warning',
                    PAID: 'success',
                    REJECTED: 'destructive'
                };
                return <Badge variant={colors[item.status]}>{item.status}</Badge>;
            }
        },
        {
            header: "Actions",
            accessorKey: "id",
            cell: (item: any) => (
                <div className="flex gap-2">
                    {item.status === 'PENDING' && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-emerald-500/50 text-emerald-600 hover:bg-emerald-500/10"
                            onClick={() => openProcessDialog(item, 'APPROVE')}
                        >
                            Approve
                        </Button>
                    )}
                    {(item.status === 'APPROVED' || item.status === 'PROCESSING') && (
                        <Button
                            size="sm"
                            className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => openProcessDialog(item, 'PAY')}
                        >
                            Mark Paid
                        </Button>
                    )}
                    {item.status !== 'PAID' && item.status !== 'REJECTED' && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-destructive hover:bg-destructive/10"
                            onClick={() => openProcessDialog(item, 'REJECT')}
                        >
                            Reject
                        </Button>
                    )}
                </div>
            )
        }
    ];

    return (
        <AuthGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <div className="min-h-screen bg-white text-foreground transition-colors duration-300">
                <Navbar />
                <Sidebar />
                <main className="min-h-screen lg:pl-72 pt-20 p-4 md:p-8 space-y-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                                Withdrawal <span className="text-primary">Requests</span>
                            </h1>
                            <p className="text-muted-foreground mt-1 text-sm md:text-base font-medium">
                                Manage payout requests from sales team
                            </p>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6 shadow-sm">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search request ID or member..."
                                    className="pl-12 h-12 bg-secondary/20 border-border rounded-xl font-medium focus:ring-primary/20"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <Button variant="outline" className="h-12 rounded-xl bg-secondary/30 border-border font-bold gap-2 flex-1 md:flex-none">
                                    <Filter className="w-4 h-4" />
                                    Filter Status
                                </Button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-4 p-4 items-center bg-white/5 rounded-2xl border border-white/5">
                                        <Skeleton className="w-12 h-12 rounded-xl" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-1/4" />
                                            <Skeleton className="h-3 w-1/6" />
                                        </div>
                                        <Skeleton className="h-8 w-24 rounded-lg" />
                                    </div>
                                ))}
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <EmptyState
                                icon={Wallet}
                                title="No withdrawal requests"
                                description="There are no pending withdrawal requests at the moment."
                            />
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <DataTable columns={columns} data={filteredRequests} />
                            </div>
                        )}
                    </div>
                </main>

                {/* Process Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {actionType === 'APPROVE' && "Approve Request"}
                                {actionType === 'PAY' && "Confirm Payment"}
                                {actionType === 'REJECT' && "Reject Request"}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {actionType === 'PAY' && (
                                <div className="space-y-2">
                                    <Label>Transaction Reference / ID</Label>
                                    <Input
                                        placeholder="e.g. TRX-123456"
                                        value={txRef}
                                        onChange={(e) => setTxRef(e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Notes / Comments</Label>
                                <Textarea
                                    placeholder={actionType === 'REJECT' ? "Reason for rejection..." : "Optional admin notes..."}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            {processingItem && (
                                <div className="bg-secondary/20 p-3 rounded-lg text-sm text-muted-foreground">
                                    <p><strong>Member:</strong> {processingItem.memberName}</p>
                                    <p><strong>Amount:</strong> {processingItem.amount}</p>
                                    <p><strong>Details:</strong> {processingItem.details}</p>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                            <Button
                                variant={actionType === 'REJECT' ? 'destructive' : 'default'}
                                onClick={handleProcessSubmit}
                            >
                                Confirm {actionType === 'PAY' ? 'Payment' : actionType === 'APPROVE' ? 'Approval' : 'Rejection'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthGuard>
    );
}
