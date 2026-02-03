"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useLanguage } from "@/components/language-provider";
import {
    Users,
    CheckCircle2,
    XCircle,
    Clock,
    Loader2,
    Filter,
    Search,
    Check,
    X,
    MoreHorizontal,
    Inbox
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";

interface UserApplication {
    id: number;
    userType: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    username: string;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
}

export default function ApplicationsPage() {
    const { t } = useLanguage();
    const [applications, setApplications] = useState<UserApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
    const [searchTerm, setSearchTerm] = useState("");

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const statusParam = filter === 'ALL' ? '' : `?status=${filter}`;
            const res = await api.get(`/user-applications${statusParam}`);
            setApplications(res.data.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load applications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, [filter]);

    const handleProcess = async (id: number, status: 'APPROVED' | 'REJECTED') => {
        const adminNotes = window.prompt(`Enter notes for this ${status.toLowerCase()} (optional):`);
        setProcessingId(id);
        try {
            await api.put(`/user-applications/${id}/process`, { status, adminNotes });
            toast.success(`Application ${status.toLowerCase()} successfully`);
            fetchApplications();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Action failed");
        } finally {
            setProcessingId(null);
        }
    };

    const filteredApps = applications.filter(app =>
        searchTerm === "" ||
        app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            header: "Applicant",
            accessorKey: "firstName" as any,
            cell: (item: UserApplication) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                        {item.firstName?.[0]}{item.lastName?.[0]}
                    </div>
                    <div>
                        <p className="font-bold">{item.firstName} {item.lastName}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">@{item.username}</p>
                    </div>
                </div>
            )
        },
        {
            header: "Requested Role",
            accessorKey: "userType" as any,
            cell: (item: UserApplication) => (
                <Badge
                    variant={
                        item.userType === 'ADMIN' ? 'destructive' :
                            item.userType === 'STAFF' ? 'info' :
                                item.userType === 'INVESTOR' ? 'success' :
                                    'warning'
                    }
                    className="font-black text-[9px] uppercase tracking-widest px-3 py-1"
                >
                    {item.userType}
                </Badge>
            )
        },
        {
            header: "Reason / Details",
            accessorKey: "reason" as any,
            cell: (item: UserApplication) => (
                <div className="max-w-[250px] whitespace-normal">
                    <p className="text-sm text-muted-foreground font-medium line-clamp-2">{item.reason || 'No reason provided'}</p>
                </div>
            )
        },
        {
            header: "Applied Date",
            accessorKey: "createdAt" as any,
            cell: (item: UserApplication) => (
                <div>
                    <p className="text-xs font-bold">{new Date(item.createdAt).toLocaleDateString()}</p>
                    <p className="text-[10px] font-medium text-muted-foreground">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
            )
        },
        {
            header: "Actions",
            accessorKey: "id" as any,
            cell: (item: UserApplication) => (
                <div className="flex items-center justify-end gap-2">
                    {item.status === 'PENDING' ? (
                        <>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-9 w-9 p-0 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-none border-none"
                                onClick={() => handleProcess(item.id, 'APPROVED')}
                                disabled={processingId === item.id}
                            >
                                {processingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check size={16} />}
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-9 w-9 p-0 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-none border-none"
                                onClick={() => handleProcess(item.id, 'REJECTED')}
                                disabled={processingId === item.id}
                            >
                                {processingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X size={16} />}
                            </Button>
                        </>
                    ) : (
                        <Badge
                            variant={item.status === 'APPROVED' ? 'success' : 'destructive'}
                            className="font-black text-[9px] uppercase tracking-widest"
                        >
                            {item.status}
                        </Badge>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-white text-foreground transition-colors duration-300">
            <Navbar />
            <Sidebar />
            <main className="min-h-screen lg:pl-72 pt-20 p-4 md:p-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                            Internal <span className="text-primary">Requests</span>
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm md:text-base font-medium">Review and manage access for staff and resellers</p>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6 shadow-sm">
                    {/* Controls */}
                    <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full lg:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search applicants..."
                                className="pl-12 h-12 bg-secondary/20 border-border rounded-xl font-medium focus:ring-primary/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2 bg-secondary/20 p-1.5 rounded-2xl border border-border overflow-x-auto whitespace-nowrap">
                            {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setFilter(s as any)}
                                    className={cn(
                                        "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        filter === s
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                    )}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex gap-4 p-4 items-center bg-white/5 rounded-2xl border border-white/5">
                                    <div className="w-12 h-12 rounded-xl bg-secondary/20 animate-pulse" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 w-1/4 bg-secondary/20 animate-pulse rounded" />
                                        <div className="h-3 w-1/6 bg-secondary/20 animate-pulse rounded" />
                                    </div>
                                    <div className="h-8 w-24 bg-secondary/20 animate-pulse rounded-lg" />
                                </div>
                            ))}
                        </div>
                    ) : filteredApps.length === 0 ? (
                        <EmptyState
                            icon={Inbox}
                            title="No applications found"
                            description={`There are no ${filter.toLowerCase()} internal access requests at this time.`}
                        />
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                        >
                            <DataTable columns={columns} data={filteredApps} pagination pageSize={10} />
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}
