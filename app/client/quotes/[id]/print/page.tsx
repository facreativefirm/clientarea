"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { useSettingsStore } from "@/lib/store/settingsStore";

export default function QuotePrintPage() {
    const params = useParams();
    const router = useRouter();
    const { settings, fetchSettings, formatPrice } = useSettingsStore();
    const [quote, setQuote] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [printMode, setPrintMode] = useState<'full' | 'letterhead'>('full');

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
            router.push("/client/billing");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = (mode: 'full' | 'letterhead') => {
        setPrintMode(mode);
        // Allow state to update before printing
        setTimeout(() => {
            window.print();
        }, 100);
    };

    if (loading || !quote) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontFamily: 'Arial, sans-serif'
            }}>
                Loading quotation...
            </div>
        );
    }

    const clientName = quote.client.user ? `${quote.client.user.firstName} ${quote.client.user.lastName}` : (quote.client.companyName || 'Valued Client');

    return (
        <>
            {/* Print Options Toolbar */}
            <div className="print:hidden no-print-toolbar" style={{
                background: '#f8f9fa',
                padding: '15px',
                // ... (rest of style) ...
            }}>
                {/* ... (buttons) ... */}
            </div>

            <div style={{
                // ... (document content) ...
            }}>
                {/* ... (content) ... */}
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0;
                        size: A4;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        background: white;
                    }
                    .print\\:hidden, .no-print-toolbar {
                        display: none !important;
                    }
                    .print-hidden-header {
                        visibility: hidden !important;
                    }
                }
                @media screen {
                    body {
                        background: #f3f4f6;
                    }
                }
            `}</style>
        </>
    );
}
