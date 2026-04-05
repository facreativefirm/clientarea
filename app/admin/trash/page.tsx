"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Trash2, RefreshCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface DeletedInvoice {
    id: number;
    invoiceNumber: string;
    totalAmount: string;
    status: string;
    deletedAt: string;
    client: {
        user: {
            firstName: string;
            lastName: string;
            email: string;
        }
    }
}

export default function TrashPage() {
    const [invoices, setInvoices] = useState<DeletedInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [restoringId, setRestoringId] = useState<number | null>(null);

    useEffect(() => {
        fetchDeletedInvoices();
    }, []);

    const fetchDeletedInvoices = async () => {
        try {
            setLoading(true);
            const res = await api.get("/invoices/trash/deleted");
            if (res.data.status === "success") {
                setInvoices(res.data.data.invoices);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to load deleted invoices");
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (id: number) => {
        if (!confirm("Are you sure you want to restore this invoice?")) return;
        try {
            setRestoringId(id);
            await api.post(`/invoices/trash/${id}/restore`);
            toast.success("Invoice restored successfully");
            fetchDeletedInvoices();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to restore invoice");
        } finally {
            setRestoringId(null);
        }
    };

    return (
        <AuthGuard allowedRoles={["SUPER_ADMIN"]}>
            <div className="min-h-screen bg-background">
                <Navbar />
                <Sidebar />
                <main className="lg:pl-72 pt-20 p-4 md:p-8 bg-white">
                    <div className="max-w-7xl mx-auto space-y-6">
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold flex items-center gap-2">
                                    <Trash2 className="text-primary" /> System Trash
                                </h1>
                                <p className="text-muted-foreground">Manage and restore deleted data</p>
                            </div>
                        </div>

                        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                            <div className="p-4 border-b bg-muted/20 font-bold text-lg">
                                Deleted Invoices
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice #</TableHead>
                                        <TableHead>Client</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Deleted On</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                            </TableCell>
                                        </TableRow>
                                    ) : invoices.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                Trash is empty. No deleted invoices.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        invoices.map((invoice) => (
                                            <TableRow key={invoice.id}>
                                                <TableCell className="font-bold flex items-center gap-2">
                                                    {invoice.invoiceNumber}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <span className="font-bold">{invoice.client?.user?.firstName} {invoice.client?.user?.lastName}</span>
                                                        <br />
                                                        <span className="text-xs text-muted-foreground">{invoice.client?.user?.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-bold">{invoice.totalAmount}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-muted-foreground">
                                                        {new Date(invoice.deletedAt).toLocaleString()}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        className="hover:bg-primary/10 hover:text-primary transition-colors"
                                                        disabled={restoringId === invoice.id}
                                                        onClick={() => handleRestore(invoice.id)}
                                                    >
                                                        {restoringId === invoice.id ? (
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        ) : (
                                                            <RefreshCcw className="h-4 w-4 mr-2" />
                                                        )}
                                                        Restore
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
