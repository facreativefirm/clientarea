"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/shared/Badge";
import { Loader2, ArrowLeft, CheckCircle, XCircle, FileText, Download } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { motion } from "framer-motion";

import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

export default function ViewQuotePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id;
    const { formatPrice } = useSettingsStore();

    const [quote, setQuote] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<'accept' | 'reject' | null>(null);

    useEffect(() => {
        fetchQuote();
    }, []);

    const fetchQuote = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/quotes/${id}`);
            const quoteData = response.data.data.quote;

            // Clients should not be able to view DRAFT quotes
            if (quoteData.status === 'DRAFT') {
                toast.error("Quote not found");
                router.push("/client/quotes");
                return;
            }

            setQuote(quoteData);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load quote details");
            router.push("/client/quotes");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        if (!confirm("Are you sure you want to accept this quote? An invoice will be generated immediately.")) return;

        setActionLoading('accept');
        try {
            const res = await api.post(`/quotes/${id}/accept`);
            toast.success("Quote accepted successfully!");
            // Redirect to the new invoice
            if (res.data.data && res.data.data.invoiceId) {
                router.push(`/client/invoices/${res.data.data.invoiceId}`);
            } else {
                fetchQuote(); // Just refresh if no invoice ID returned (fallback)
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to accept quote");
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!confirm("Are you sure you want to reject this proposal?")) return;

        setActionLoading('reject');
        try {
            await api.post(`/quotes/${id}/reject`);
            toast.success("Quote rejected");
            fetchQuote();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to reject quote");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent">
                <Navbar />
                <Sidebar />
                <main className="lg:pl-72 pt-20 p-4 md:p-8 flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={32} />
                </main>
            </div>
        );
    }

    if (!quote) return null;

    return (
        <div className="min-h-screen bg-transparent">
            <Navbar />
            <Sidebar />
            <main className="lg:pl-72 pt-20 p-4 md:p-8 space-y-6">
                <Button variant="ghost" asChild className="pl-0 gap-2 text-gray-500 hover:text-gray-900">
                    <Link href="/client/quotes">
                        <ArrowLeft size={18} /> Back to Quotes
                    </Link>
                </Button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gray-50/50 p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-6">
                        <div>
                            <Badge variant={
                                quote.status === 'ACCEPTED' ? 'success' :
                                    quote.status === 'REJECTED' ? 'destructive' :
                                        quote.status === 'SENT' ? 'info' : 'secondary'
                            } className="mb-4">
                                {quote.status}
                            </Badge>
                            <h1 className="text-3xl font-bold text-gray-900">Quote #{quote.quoteNumber}</h1>
                            <p className="text-gray-500 mt-2 text-lg">{quote.subject}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                            <p className="text-3xl font-bold text-primary">{formatPrice(quote.totalAmount)}</p>
                            <p className="text-sm text-gray-400 mt-2">Valid until {new Date(quote.validUntil).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-8 space-y-8">
                        {/* Items Table */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Items & Services</h3>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                                        <tr>
                                            <th className="px-4 py-3">Description</th>
                                            <th className="px-4 py-3 w-24 text-center">Qty</th>
                                            <th className="px-4 py-3 w-32 text-right">Price</th>
                                            <th className="px-4 py-3 w-32 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {quote.items.map((item: any, i: number) => (
                                            <tr key={i}>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium">{item.description}</p>
                                                    {item.domainName && (
                                                        <p className="text-xs text-blue-600 mt-0.5">Domain: {item.domainName}</p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right">{formatPrice(item.unitPrice)}</td>
                                                <td className="px-4 py-3 text-right font-medium">{formatPrice(item.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50/50 font-semibold">
                                        <tr>
                                            <td colSpan={3} className="px-4 py-3 text-right">Total</td>
                                            <td className="px-4 py-3 text-right text-lg">{formatPrice(quote.totalAmount)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Terms & Notes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                            {quote.notes && (
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                                    <p className="text-gray-600 text-sm whitespace-pre-line">{quote.notes}</p>
                                </div>
                            )}
                            {quote.terms && (
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <h4 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h4>
                                    <p className="text-gray-600 text-sm whitespace-pre-line">{quote.terms}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="bg-gray-50 p-6 flex flex-col sm:flex-row justify-end gap-4 items-center border-t border-gray-100">
                        {(quote.status === 'SENT') ? (
                            <>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={handleReject}
                                    disabled={actionLoading !== null}
                                >
                                    {actionLoading === 'reject' ? <Loader2 className="animate-spin mr-2" /> : <XCircle className="mr-2" size={18} />}
                                    Reject Proposal
                                </Button>
                                <Button
                                    size="lg"
                                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                                    onClick={handleAccept}
                                    disabled={actionLoading !== null}
                                >
                                    {actionLoading === 'accept' ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2" size={18} />}
                                    Accept Quote
                                </Button>
                            </>
                        ) : quote.status === 'ACCEPTED' ? (
                            <div className="flex items-center gap-4 w-full justify-between sm:justify-end">
                                <div className="flex items-center text-green-600 font-medium">
                                    <CheckCircle className="mr-2" size={20} />
                                    Accepted on {new Date(quote.updatedAt).toLocaleDateString()}
                                </div>
                                {quote.invoiceId && (
                                    <Button asChild variant="default">
                                        <Link href={`/client/invoices/${quote.invoiceId}`}>
                                            <FileText className="mr-2" size={18} /> View Invoice
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="text-red-600 font-medium flex items-center">
                                <XCircle className="mr-2" size={20} />
                                Rejected
                            </div>
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
