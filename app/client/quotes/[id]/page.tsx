"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Download, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";
import { useLanguage } from "@/components/language-provider";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { cn } from "@/lib/utils";

export default function ClientQuoteDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { t } = useLanguage();
    const { settings, fetchSettings, formatPrice } = useSettingsStore();
    const [quote, setQuote] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const componentRef = useRef<HTMLDivElement>(null);

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
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load quotation details");
            router.push("/client/billing");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.open(`/client/quotes/${params.id}/print`, '_blank');
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
                    taxName={settings.taxName}
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
        <div className="min-h-screen bg-white text-foreground transition-colors duration-300 print:bg-white print:text-black">
            <div className="print:hidden">
                <Navbar />
                <Sidebar />
            </div>

            <main className="pl-0 lg:pl-72 pt-20 p-8 flex justify-center print:p-0 print:pt-0 print:pl-0 print:m-0">
                <div className="w-full max-w-4xl space-y-8 print:w-full print:max-w-none">

                    {/* Header Actions - Hidden in Print */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
                        <div className="flex items-center gap-4">
                            <Link href="/client/billing">
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
                            {/* <Button variant="outline" onClick={handlePrint} className="gap-2">
                                <Printer size={16} />
                                Print
                            </Button> */}
                            <Button variant="outline" onClick={handleDownload} className="gap-2">
                                <Download size={16} />
                                Download PDF
                            </Button>
                        </div>
                    </div>

                    {/* Quote Content */}
                    <div
                        ref={componentRef}
                        className="bg-card text-card-foreground rounded-[2rem] p-8 md:p-12 shadow-xl border border-border/50 print:shadow-none print:border-none print:rounded-none print:bg-white print:text-black print:p-8"
                        id="quote-content"
                    >
                        {/* Quote Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start border-b border-border/10 pb-8 mb-8 gap-8">
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <img
                                        src="/Facreativefirmltd.png"
                                        alt="Logo"
                                        className="w-8 h-8 rounded-lg object-contain bg-white"
                                    />
                                    <h2 className="text-2xl font-bold text-primary">{settings.appName || 'FA CRM'}</h2>
                                </div>
                                <div className="text-sm text-muted-foreground print:text-gray-600 whitespace-pre-line">
                                    {settings.companyAddress || (
                                        <>
                                            <p>123 Hosting Street</p>
                                            <p>Dhaka, Bangladesh</p>
                                        </>
                                    )}
                                    <p>{settings.supportEmail || 'support@whmcscrm.com'}</p>
                                </div>
                            </div>
                            <div className="text-left md:text-right">
                                <h1 className="text-4xl font-light text-primary/80 mb-2">QUOTATION</h1>
                                <p className="font-mono text-lg">#{quote.quoteNumber || quote.id}</p>
                                <p className="text-sm text-muted-foreground mt-1">Date: {new Date(quote.proposalDate).toLocaleDateString()}</p>
                                <p className="text-sm text-muted-foreground">Valid Until: {new Date(quote.validUntil).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Client & Company Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Prepared For</h3>
                                <div className="font-medium text-lg mb-1">
                                    {clientName}
                                </div>
                                {quote.client.companyName && (
                                    <div className="text-muted-foreground mb-1">{quote.client.companyName}</div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Validity Status</h3>
                                <div className="bg-secondary/10 rounded-xl p-4 border border-border/50">
                                    {isExpired ? (
                                        <div className="flex items-center gap-3 text-gray-500">
                                            <Clock size={20} />
                                            <span className="font-bold">Expired on {new Date(quote.validUntil).toLocaleDateString()}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 text-emerald-500">
                                            <CheckCircle size={20} />
                                            <span className="font-bold">Valid until {new Date(quote.validUntil).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="mb-12 overflow-x-auto">
                            <table className="w-full text-left min-w-[500px]">
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
                                        <tr key={item.id} className="border-b border-border/5">
                                            <td className="py-4 pr-4">
                                                <p className="font-semibold text-sm">{item.description}</p>
                                            </td>
                                            <td className="py-4 text-center text-muted-foreground text-sm">
                                                {item.quantity}
                                            </td>
                                            <td className="py-4 text-right text-muted-foreground text-sm">
                                                {formatPrice(item.unitPrice)}
                                            </td>
                                            <td className="py-4 text-right font-bold text-sm text-primary">
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

                        {/* Terms & Notes Section */}
                        {(quote.terms || quote.notes) && (
                            <div className="mt-12 pt-8 border-t border-border/10 space-y-6">
                                {quote.notes && (
                                    <div>
                                        <h4 className="font-semibold text-sm mb-2 opacity-50 uppercase tracking-widest px-1">Notes</h4>
                                        <div className="text-sm bg-secondary/10 p-4 rounded-2xl border border-white/5 whitespace-pre-wrap">
                                            {quote.notes}
                                        </div>
                                    </div>
                                )}
                                {quote.terms && (
                                    <div>
                                        <h4 className="font-semibold text-sm mb-2 opacity-50 uppercase tracking-widest px-1">Terms & Conditions</h4>
                                        <div className="text-sm bg-secondary/10 p-4 rounded-2xl border border-white/5 whitespace-pre-wrap">
                                            {quote.terms}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mt-12 text-center text-xs text-muted-foreground print:mt-20">
                            <p>Thank you for considering our proposal.</p>
                            <p className="mt-1">Generated by {settings.appName || 'FA CRM'}</p>
                        </div>
                    </div>
                </div>
            </main>

            <style jsx global>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body { background: white; color: black; }
                }
            `}</style>
        </div>
    );
}
