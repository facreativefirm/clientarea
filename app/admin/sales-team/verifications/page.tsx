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
    MapPin,
    FileText,
    Calendar,
    Briefcase,
    ShieldAlert
} from "lucide-react";
import api from "@/lib/api";
import { Skeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { toast } from "sonner";

export default function AdminVerificationsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [prospects, setProspects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);

    useEffect(() => {
        fetchProspects();
    }, []);

    const fetchProspects = async () => {
        setLoading(true);
        try {
            // TODO: Replace with real endpoint GET /sales-team/prospects/all or with query params
            const res = await api.get('/sales-team/admin/prospects');
            // Assuming response data matches our interface or needs mapping
            // VerificationRequest interface matches ProspectClient mostly
            const mappedRequests = res.data.data.map((p: any) => ({
                id: p.id,
                salesRepName: `${p.salesMember?.user?.firstName} ${p.salesMember?.user?.lastName}`,
                salesRepTerritory: p.salesMember?.territory || 'Unassigned',
                companyName: p.companyName,
                contactPerson: p.contactPerson,
                submittedAt: p.createdAt,
                status: p.verificationStatus, // Using verificationStatus for this table
                proofType: p.proofSubmissions?.[0]?.proofType || 'NONE',
                proofUrl: p.proofSubmissions?.[0]?.fileUrl,
                notes: p.notes
            }));
            setProspects(mappedRequests);
        } catch (err) {
            console.error("Failed to fetch verification requests", err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id: number, status: 'APPROVED' | 'REJECTED') => {
        setProcessingId(id);
        try {
            await api.put(`/sales-team/prospects/${id}/verify`, { status });
            toast.success(`Prospect ${status === 'APPROVED' ? 'verified' : 'rejected'} successfully`);
            // Update local state
            setProspects(prev => prev.map(p => p.id === id ? { ...p, status: status === 'APPROVED' ? 'VERIFIED' : 'REJECTED' } : p));
        } catch (err) {
            console.error(err);
            toast.error("Action failed");
        } finally {
            setProcessingId(null);
        }
    };

    const handleFraud = async (id: number) => {
        const reason = window.prompt("Enter reason for marking this as fraud (False Information):");
        if (reason === null) return; // Cancelled
        if (!reason.trim()) {
            toast.error("Reason is required to flag fraud");
            return;
        }

        const confirm = window.confirm("Are you sure? This will REJECT the prospect and DEDUCT 10 points from the sales rep's wallet.");
        if (!confirm) return;

        setProcessingId(id);
        try {
            await api.put(`/sales-team/prospects/${id}/fraud`, { reason });
            toast.success("Flagged as fraud and points deducted.");
            // Update local state
            setProspects(prev => prev.map(p => p.id === id ? { ...p, status: 'REJECTED' } : p));
        } catch (err) {
            console.error(err);
            toast.error("Failed to flag fraud");
        } finally {
            setProcessingId(null);
        }
    };

    const filteredProspects = prospects.filter(p =>
        p.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.salesRepName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            header: "Prospect",
            accessorKey: "companyName",
            cell: (item: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                        <Briefcase size={18} />
                    </div>
                    <div>
                        <p className="font-bold">{item.companyName}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item.contactPerson}</p>
                    </div>
                </div>
            )
        },
        {
            header: "Sales Rep",
            accessorKey: "salesRepName",
            cell: (item: any) => (
                <div>
                    <p className="font-medium text-sm">{item.salesRepName}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin size={10} /> {item.territory}
                    </div>
                </div>
            )
        },
        {
            header: "Proof",
            accessorKey: "proofType",
            cell: (item: any) => (
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] gap-1">
                        {item.proofType === 'PHOTO' ? <FileText size={10} /> : <MapPin size={10} />}
                        {item.proofType}
                    </Badge>
                    {item.proofUrl !== '#' && <a href={item.proofUrl} target="_blank" className="text-xs text-primary underline">View</a>}
                </div>
            )
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (item: any) => {
                const colors: any = { PENDING: 'warning', VERIFIED: 'success', REJECTED: 'destructive' };
                return <Badge variant={colors[item.status]}>{item.status}</Badge>;
            }
        },
        {
            header: "Submitted",
            accessorKey: "submittedAt",
            cell: (item: any) => (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar size={12} />
                    {new Date(item.submittedAt).toLocaleDateString()}
                </div>
            )
        },
        {
            header: "Actions",
            accessorKey: "actions",
            cell: (item: any) => (
                <div className="flex gap-2">
                    {item.status === 'PENDING' && (
                        <>
                            <Button
                                size="sm"
                                variant="default"
                                className="h-8 bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => handleVerify(item.id, 'APPROVED')}
                                disabled={processingId === item.id}
                            >
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Verify
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                className="h-8"
                                onClick={() => handleVerify(item.id, 'REJECTED')}
                                disabled={processingId === item.id}
                            >
                                <XCircle className="w-3 h-3 mr-1" /> Reject
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 border-rose-200 text-rose-600 hover:bg-rose-50"
                                onClick={() => handleFraud(item.id)}
                                disabled={processingId === item.id}
                            >
                                <ShieldAlert className="w-3 h-3 mr-1" /> Fraud Penalty
                            </Button>
                        </>
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
                <main className="lg:pl-72 pt-20 p-4 md:p-8 space-y-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                                Prospect <span className="text-primary">Verifications</span>
                            </h1>
                            <p className="text-muted-foreground mt-1 text-sm md:text-base font-medium">
                                Review and verify sales team submissions
                            </p>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6 shadow-sm">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search company or rep..."
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
                        ) : filteredProspects.length === 0 ? (
                            <EmptyState
                                icon={FileText}
                                title="No pending verifications"
                                description="All catch up! No verification requests found matching your criteria."
                            />
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <DataTable columns={columns} data={filteredProspects} />
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
