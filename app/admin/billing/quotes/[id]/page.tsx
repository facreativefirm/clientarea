"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Printer, Download, Mail, Save, CheckCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";
import { useLanguage } from "@/components/language-provider";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { cn } from "@/lib/utils";

export default function AdminQuoteDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { t } = useLanguage();
    const { settings, fetchSettings, formatPrice } = useSettingsStore();
    const [quote, setQuote] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const componentRef = useRef<HTMLDivElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedQuote, setEditedQuote] = useState<any>(null);

    useEffect(() => {
        fetchSettings();
        fetchQuote();
    }, [params.id]);

    const fetchQuote = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/quotes/${params.id}`);
            if (response.data.status === 'success') {
                setQuote(response.data.data.quote);
                setEditedQuote(response.data.data.quote);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load quotation details");
            router.push("/admin/billing/quotes");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.open(`/admin/billing/quotes/${params.id}/print`, '_blank');
    };

    const handleDownload = async () => {
        if (!quote) return;

        try {
            const { pdf } = await import('@react-pdf/renderer');
            const { QuotePDF } = await import('@/components/pdf/QuotePDF');

            const blob = await pdf(
                <QuotePDF
                    quote={quote as any}
                    appName={settings.appName || 'FA CRM'}
                    companyAddress={settings.companyAddress}
                    supportEmail={settings.supportEmail}
                    currencyCode={settings.defaultCurrency || 'USD'}
                />
            ).toBlob();

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Quotation-${quote.quoteNumber || quote.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success("PDF downloaded successfully");
        } catch (error) {
            console.error("PDF generation error:", error);
            toast.error("Failed to generate PDF");
        }
    };

    const handleSave = async () => {
        if (!editedQuote) return;

        try {
            const response = await api.patch(`/quotes/${params.id}`, {
                notes: editedQuote.notes,
                terms: editedQuote.terms,
                status: editedQuote.status
            });

            if (response.data.status === 'success') {
                setQuote(response.data.data.quote);
                setEditedQuote(response.data.data.quote);
                setIsEditing(false);
                toast.success("Quotation updated successfully");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update quotation");
        }
    };

    const handleSend = async () => {
        try {
            const response = await api.post(`/quotes/${params.id}/send`);
            if (response.data.status === 'success') {
                toast.success("Quotation sent successfully");
                fetchQuote();
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to send quotation");
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        try {
            const response = await api.patch(`/quotes/${params.id}`, { status: newStatus });
            if (response.data.status === 'success') {
                setQuote(response.data.data.quote);
                setEditedQuote(response.data.data.quote);
                toast.success(`Quotation ${newStatus.toLowerCase()}`);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background text-foreground">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!quote) return null;

    const clientName = quote.client.user ? `${quote.client.user.firstName} ${quote.client.user.lastName}` : (quote.client.companyName || 'Valued Client');
    const contact = quote.client.contacts?.[0];
    const isExpired = new Date(quote.validUntil) < new Date();

    return (
        <AuthGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <div className="min-h-screen bg-white text-foreground transition-colors duration-300 print:bg-white print:text-black">
                <div className="print:hidden">
                    <Navbar />
                    <Sidebar />
                </div>

                <main className="pl-0 md:pl-75 pt-20 p-8 flex justify-center print:p-0 print:pt-0 print:pl-0 print:m-0">
                    <div className="w-full max-w-4xl space-y-8 print:w-full print:max-w-none">

                        {/* Header Actions - Hidden in Print */}
                        <div className="flex items-center justify-between print:hidden">
                            <div className="flex items-center gap-4">
                                <Link href="/admin/billing/quotes">
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <ArrowLeft size={20} />
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className="text-3xl font-bold">Quotation #{quote.quoteNumber || quote.id}</h1>
                                    <span className={cn(
                                        "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                        quote.status === 'ACCEPTED' ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" :
                                            quote.status === 'REJECTED' ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800" :
                                                isExpired ? "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800" :
                                                    "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                                    )}>
                                        {isExpired && quote.status === 'DRAFT' ? 'EXPIRED' : quote.status}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={handlePrint} className="gap-2">
                                    <Printer size={16} />
                                    Print
                                </Button>
                                <Button variant="outline" onClick={handleDownload} className="gap-2">
                                    <Download size={16} />
                                    Download PDF
                                </Button>
                                {quote.status === 'DRAFT' && (
                                    <Button onClick={handleSend} className="gap-2">
                                        <Mail size={16} />
                                        Send to Client
                                    </Button>
                                )}
                                {quote.status === 'SENT' && !isExpired && (
                                    <>
                                        <Button onClick={() => handleStatusChange('ACCEPTED')} className="gap-2 bg-green-600 hover:bg-green-700">
                                            <CheckCircle size={16} />
                                            Accept
                                        </Button>
                                        <Button onClick={() => handleStatusChange('REJECTED')} variant="destructive" className="gap-2">
                                            <XCircle size={16} />
                                            Reject
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Quote Content */}
                        <div
                            ref={componentRef}
                            className="bg-card text-card-foreground rounded-[2rem] p-12 shadow-xl border border-border/50 print:shadow-none print:border-none print:rounded-none print:bg-white print:text-black print:p-8"
                            id="quote-content"
                        >
                            {/* Quote Header */}
                            <div className="flex justify-between items-start border-b border-border/10 pb-8 mb-8">
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                                            W
                                        </div>
                                        <h2 className="text-2xl font-bold text-primary">{settings.appName || 'FA CRM'}</h2>
                                    </div>
                                    <div className="text-sm text-muted-foreground print:text-gray-600 whitespace-pre-line">
                                        {settings.companyAddress || (
                                            <>
                                                <p>4210 Oxygen Chittagong</p>
                                                <p>Chittagong, Bangladesh</p>
                                            </>
                                        )}
                                        <p>{settings.supportEmail || 'naimursharon@gmail.com'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h1 className="text-4xl font-light text-primary/80 mb-2">QUOTATION</h1>
                                    <p className="font-mono text-lg">#{quote.quoteNumber || quote.id}</p>
                                    <p className="text-sm text-muted-foreground mt-1">Date: {new Date(quote.proposalDate).toLocaleDateString()}</p>
                                    <p className="text-sm text-muted-foreground">Valid Until: {new Date(quote.validUntil).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Client & Company Info */}
                            <div className="grid grid-cols-2 gap-12 mb-2">
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Prepared For</h3>
                                    <div className="font-medium text-lg mb-1">
                                        {clientName}
                                    </div>
                                    {quote.client.companyName && (
                                        <div className="text-muted-foreground mb-1">{quote.client.companyName}</div>
                                    )}
                                </div>
                            </div>

                            {/* Table */}
                            <div className="mb-5">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-border/50">
                                            <th className="py-3 font-semibold text-sm text-muted-foreground w-1/2">Description</th>
                                            <th className="py-3 font-semibold text-sm text-muted-foreground text-center">Qty</th>
                                            <th className="py-3 font-semibold text-sm text-muted-foreground text-right">Unit Price</th>
                                            <th className="py-3 font-semibold text-sm text-muted-foreground text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/10">
                                        {quote.items.map((item: any) => (
                                            <tr key={item.id}>
                                                <td className="py-1">
                                                    <p className="font-medium">{item.description}</p>
                                                </td>
                                                <td className="py-1 text-center text-muted-foreground">
                                                    {item.quantity}
                                                </td>
                                                <td className="py-1 text-right text-muted-foreground">
                                                    {formatPrice(item.unitPrice)}
                                                </td>
                                                <td className="py-1 text-right font-medium">
                                                    {formatPrice(item.amount || (item.quantity * item.unitPrice))}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals */}
                            <div className="flex justify-end">
                                <div className="w-64 space-y-3">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(quote.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Tax</span>
                                        <span>{formatPrice(quote.taxTotal || 0)}</span>
                                    </div>
                                    <div className="pt-3 border-t border-border flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span className="text-primary">{formatPrice(quote.totalAmount)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Notes Section */}
                            {(quote.notes || quote.terms) && (
                                <div className="mt-2 pt-2 border-t border-border/10 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {quote.notes && (
                                        <div>
                                            <h4 className="font-semibold text-sm mb-2 opacity-50 uppercase tracking-widest px-1">Client Notes</h4>
                                            {isEditing ? (
                                                <Textarea
                                                    value={editedQuote?.notes || ''}
                                                    onChange={(e) => setEditedQuote({ ...editedQuote, notes: e.target.value })}
                                                    className="min-h-[100px]"
                                                />
                                            ) : (
                                                <div className="text-sm bg-secondary/10 p-4 rounded-2xl border border-white/5 whitespace-pre-wrap">
                                                    {quote.notes}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-12 text-center text-xs text-muted-foreground print:mt-20">
                                <p>Thank you for considering our proposal.</p>
                                <p className="mt-1">Generated by {settings.appName || 'FA CRM'}</p>
                            </div>
                        </div>

                        {/* Edit Controls - Hidden in Print */}
                        {isEditing && (
                            <div className="flex justify-end gap-2 print:hidden">
                                <Button variant="outline" onClick={() => {
                                    setIsEditing(false);
                                    setEditedQuote(quote);
                                }}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} className="gap-2">
                                    <Save size={16} />
                                    Save Changes
                                </Button>
                            </div>
                        )}

                        {!isEditing && quote.status === 'DRAFT' && (
                            <div className="flex justify-end print:hidden">
                                <Button variant="outline" onClick={() => setIsEditing(true)}>
                                    Edit Quotation
                                </Button>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <style jsx global>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body { background: white; color: black; }
                }
            `}</style>
        </AuthGuard>
    );
}
