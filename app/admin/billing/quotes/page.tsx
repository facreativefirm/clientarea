"use client";

import React, { useState, useEffect } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useLanguage } from "@/components/language-provider";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, FileText, Send, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { motion } from "framer-motion";

export default function AdminQuotesPage() {
    const { t } = useLanguage();
    const { formatPrice } = useSettingsStore();

    const [quotes, setQuotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuotes();
    }, []);

    const fetchQuotes = async () => {
        try {
            setLoading(true);
            const response = await api.get("/quotes");
            setQuotes(response.data.data.quotes || []);
        } catch (err) {
            console.error("Error fetching quotes:", err);
            toast.error("Failed to load quotes");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this quote?")) return;
        try {
            await api.delete(`/quotes/${id}`);
            toast.success("Quote deleted successfully");
            fetchQuotes();
        } catch (err) {
            toast.error("Failed to delete quote");
        }
    };

    const handleSend = async (id: number) => {
        try {
            await api.post(`/quotes/${id}/send`);
            toast.success("Quote sent to client");
            fetchQuotes();
        } catch (err) {
            toast.error("Failed to send quote");
        }
    };

    const columns = [
        {
            header: "Quote #",
            accessorKey: "quoteNumber" as any,
            cell: (item: any) => <span className="font-bold">{item.quoteNumber}</span>
        },
        {
            header: "Subject",
            accessorKey: "subject" as any,
            cell: (item: any) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{item.subject || 'No Subject'}</span>
                </div>
            )
        },
        {
            header: "Client",
            accessorKey: "clientId" as any,
            cell: (item: any) => {
                const user = item.client?.user;
                return user ? (
                    <div className="flex flex-col">
                        <span className="font-medium text-sm">{user.firstName} {user.lastName}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                ) : 'N/A';
            }
        },
        {
            header: "Total",
            accessorKey: "totalAmount" as any,
            cell: (item: any) => <span className="font-bold">{formatPrice(item.totalAmount)}</span>
        },
        {
            header: "Date",
            accessorKey: "proposalDate" as any,
            cell: (item: any) => new Date(item.proposalDate).toLocaleDateString()
        },
        {
            header: "Valid Until",
            accessorKey: "validUntil" as any,
            cell: (item: any) => new Date(item.validUntil).toLocaleDateString()
        },
        {
            header: "Status",
            accessorKey: "status" as any,
            cell: (item: any) => (
                <Badge variant={
                    item.status === 'ACCEPTED' ? 'success' :
                        item.status === 'REJECTED' ? 'destructive' :
                            item.status === 'SENT' ? 'info' : 'secondary'
                }>
                    {item.status}
                </Badge>
            )
        },
        {
            header: "Actions",
            accessorKey: "id" as any,
            cell: (item: any) => (
                <div className="flex items-center gap-2">
                    {item.status === 'DRAFT' && (
                        <>
                            <Button size="sm" variant="outline" onClick={() => handleSend(item.id)} title="Send to Client">
                                <Send size={14} />
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                                <Link href={`/admin/billing/quotes/${item.id}`}>
                                    <Pencil size={14} />
                                </Link>
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                                <Trash2 size={14} />
                            </Button>
                        </>
                    )}
                    {item.status !== 'DRAFT' && (
                        <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/billing/quotes/${item.id}`}>
                                <FileText size={14} />
                            </Link>
                        </Button>
                    )}
                </div>
            )
        }
    ];

    return (
        <AuthGuard allowedRoles={["ADMIN", "SUPER_ADMIN", "STAFF"]}>
            <div className="min-h-screen bg-gray-50/50">
                <Navbar />
                <Sidebar />
                <main className="lg:pl-72 pt-20 p-4 md:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Quotations</h1>
                            <p className="text-gray-500 mt-1">Manage proposals and estimates for clients.</p>
                        </div>
                        <Button asChild className="space-x-2">
                            <Link href="/admin/billing/quotes/create">
                                <Plus size={18} />
                                <span>Create Quote</span>
                            </Link>
                        </Button>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <Loader2Icon className="animate-spin mb-2" size={32} />
                                <p>Loading quotes...</p>
                            </div>
                        ) : (
                            <DataTable columns={columns} data={quotes} />
                        )}
                    </motion.div>
                </main>
            </div>
        </AuthGuard>
    );
}

function Loader2Icon({ className, size }: { className?: string, size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}
