"use client";

import React, { useState, useEffect } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useLanguage } from "@/components/language-provider";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter, MoreHorizontal, User, Mail, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import Link from "next/link";
import { Skeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";

export default function AdminClientsPage() {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState("");
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalClients, setTotalClients] = useState(0);

    // Debounce search and pagination
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchClients();
        }, 500); // 500ms debounce
        return () => clearTimeout(timer);
    }, [page, searchTerm, limit]);

    const fetchClients = async () => {
        try {
            setLoading(true);
            // Construct query params
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(searchTerm && { search: searchTerm })
            });

            const response = await api.get(`/clients?${params.toString()}`);

            if (response.data.data) {
                setClients(response.data.data.clients || []);
                const meta = response.data.data.meta;
                if (meta) {
                    setTotalPages(meta.totalPages);
                    setTotalClients(meta.total);
                }
            }
            setError(null);
        } catch (err: any) {
            console.error("Error fetching clients:", err);
            setError(err.response?.data?.message || "Failed to load clients");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(1); // Reset to page 1 on search
    };

    const columns = [
        {
            header: t("client_name"),
            accessorKey: "user.firstName" as any,
            cell: (item: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                        {item.user?.firstName?.[0] || '?'}{item.user?.lastName?.[0] || '?'}
                    </div>
                    <div>
                        <p className="font-bold">{item.user?.firstName} {item.user?.lastName}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item.companyName || 'No company'}</p>
                    </div>
                </div>
            )
        },
        {
            header: t("contact"),
            accessorKey: "user.email" as any,
            cell: (item: any) => (
                <div className="flex flex-col text-sm font-medium">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Mail className="w-3.5 h-3.5 text-primary/50" /> {item.user?.email}
                    </span>
                </div>
            )
        },
        {
            header: t("status"),
            accessorKey: "status" as any,
            cell: (item: any) => (
                <Badge variant={item.status === 'ACTIVE' ? 'success' : 'secondary'}>
                    {item.status?.toLowerCase()}
                </Badge>
            )
        },
        {
            header: t("created"),
            accessorKey: "createdAt" as any,
            cell: (item: any) => new Date(item.createdAt).toLocaleDateString()
        },
        {
            header: t("actions"),
            accessorKey: "id" as any,
            cell: (item: any) => (
                <div className="flex gap-2">
                    <Link href={`/admin/clients/${item.id}`}>
                        <Button variant="ghost" size="sm" className="font-bold">View Profile</Button>
                    </Link>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-white text-foreground transition-colors duration-300">
            <Navbar />
            <Sidebar />
            <main className="min-h-screen lg:pl-72 pt-20 p-4 md:p-8 space-y-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                            Client <span className="text-primary">Directory</span>
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm md:text-base font-medium">
                            Manage your client base ({totalClients} total)
                        </p>
                    </div>
                    <Link href="/admin/clients/add" className="w-full md:w-auto">
                        <Button className="h-12 px-6 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md gap-2 w-full md:w-auto">
                            <Plus className="w-4 h-4" />
                            Add New Client
                        </Button>
                    </Link>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search clients..."
                                className="pl-12 h-12 bg-secondary/20 border-border rounded-xl font-medium focus:ring-primary/20"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto items-center">
                            <select
                                className="h-12 px-4 rounded-xl bg-secondary/20 border-border font-medium focus:ring-primary/20"
                                value={limit}
                                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                            >
                                <option value={10}>10 per page</option>
                                <option value={20}>20 per page</option>
                                <option value={50}>50 per page</option>
                                <option value={100}>100 per page</option>
                            </select>
                            <Button variant="outline" className="h-12 rounded-xl bg-secondary/30 border-border font-bold gap-2 flex-1 md:flex-none">
                                <Filter className="w-4 h-4" />
                                Filter
                            </Button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
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
                    ) : error ? (
                        <div className="text-center py-12 text-destructive">
                            <p className="font-bold mb-4">{error}</p>
                            <Button onClick={fetchClients} variant="outline" className="rounded-xl border-destructive/50 hover:bg-destructive/10">Retry</Button>
                        </div>
                    ) : clients.length === 0 ? (
                        <EmptyState
                            icon={User}
                            title="No clients found."
                            description={searchTerm ? "No clients match your search criteria." : "You don't have any clients registered in the system yet."}
                            actionLabel={searchTerm ? "Clear Search" : "Add New Client"}
                            onAction={searchTerm ? () => setSearchTerm("") : () => window.location.href = '/admin/clients/add'}
                        />
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                            <DataTable columns={columns} data={clients} />

                            {/* Pagination Controls */}
                            <div className="flex justify-between items-center py-4 border-t border-border mt-4">
                                <div className="text-sm text-muted-foreground font-medium">
                                    Showing <span className="text-foreground font-bold">{((page - 1) * limit) + 1}</span> to <span className="text-foreground font-bold">{Math.min(page * limit, totalClients)}</span> of <span className="text-foreground font-bold">{totalClients}</span> results
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="h-9 px-4 font-bold"
                                    >
                                        Previous
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            // Logic to show pages around current page could be complex, 
                                            // for now just simple 1-5 or if totalPages is small. 
                                            // A robust component is better, but this simple one works for now.
                                            let pNum = i + 1;
                                            if (totalPages > 5 && page > 3) {
                                                pNum = page - 3 + i;
                                                if (pNum > totalPages) pNum = i + (totalPages - 4);
                                            }

                                            // Ensure we don't go out of bounds (simple fix)
                                            if (pNum < 1) pNum = 1;

                                            return (
                                                <Button
                                                    key={i}
                                                    variant={page === pNum ? "default" : "ghost"}
                                                    size="sm"
                                                    onClick={() => setPage(pNum)}
                                                    className={`w-9 h-9 font-bold ${page === pNum ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                                                >
                                                    {pNum}
                                                </Button>
                                            );
                                        })}
                                        {totalPages > 5 && page < totalPages - 2 && (
                                            <>
                                                <span className="text-muted-foreground">...</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setPage(totalPages)}
                                                    className="w-9 h-9 font-bold text-muted-foreground"
                                                >
                                                    {totalPages}
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="h-9 px-4 font-bold"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
