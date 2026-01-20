"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/language-provider";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { motion } from "framer-motion";

import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

export default function ClientQuotesPage() {
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
            const response = await api.get("/quotes"); // The backend automatically filters by client
            const allQuotes = response.data.data.quotes || [];
            // Filter out DRAFT quotes for clients
            setQuotes(allQuotes.filter((q: any) => q.status !== 'DRAFT'));
        } catch (err) {
            console.error("Error fetching quotes:", err);
            toast.error("Failed to load your quotes");
        } finally {
            setLoading(false);
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
                    <span className="font-medium">{item.subject}</span>
                    <span className="text-xs text-muted-foreground">Valid until {new Date(item.validUntil).toLocaleDateString()}</span>
                </div>
            )
        },
        {
            header: "Amount",
            accessorKey: "totalAmount" as any,
            cell: (item: any) => <span className="font-bold">{formatPrice(item.totalAmount)}</span>
        },
        {
            header: "Date",
            accessorKey: "proposalDate" as any,
            cell: (item: any) => new Date(item.proposalDate).toLocaleDateString()
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
            header: "Action",
            accessorKey: "id" as any,
            cell: (item: any) => (
                <Link href={`/client/quotes/${item.id}`}>
                    <Button variant="ghost" size="sm" className="gap-2">
                        View <ArrowRight size={14} />
                    </Button>
                </Link>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-transparent">
            <Navbar />
            <Sidebar />
            <main className="lg:pl-72 pt-20 p-4 md:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Quotes</h1>
                        <p className="text-gray-500 mt-1">Review and accept proposals sent to you.</p>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <Loader2 className="animate-spin mb-2" size={32} />
                            <p>Loading quotes...</p>
                        </div>
                    ) : (
                        <DataTable columns={columns} data={quotes} />
                    )}
                </motion.div>
            </main>
        </div>
    );
}
