"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { useSettingsStore } from "@/lib/store/settingsStore";

export default function MoneyReceiptPrintPage() {
    const params = useParams();
    const router = useRouter();
    const { settings, fetchSettings, formatPrice } = useSettingsStore();
    const [transaction, setTransaction] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [printMode, setPrintMode] = useState<'full' | 'letterhead'>('full');

    useEffect(() => {
        fetchSettings();
        fetchTransaction();
    }, [params.id]);

    const fetchTransaction = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/finance/transactions/${params.id}`);
            if (response.data.status === 'success') {
                setTransaction(response.data.data.transaction);
            }
        } catch (error) {
            console.error(error);
            router.push("/client/transactions");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = (mode: 'full' | 'letterhead') => {
        setPrintMode(mode);
        setTimeout(() => {
            window.print();
        }, 100);
    };

    if (loading || !transaction) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontFamily: 'Arial, sans-serif'
            }}>
                Loading money receipt...
            </div>
        );
    }

    const { invoice } = transaction;
    const clientName = invoice.client.user ? `${invoice.client.user.firstName} ${invoice.client.user.lastName}` : (invoice.client.companyName || 'Valued Client');

    return (
        <>
            <div className="print:hidden no-print-toolbar" style={{
                background: '#f8f9fa',
                padding: '15px',
                marginBottom: '20px',
                borderBottom: '1px solid #e9ecef',
                display: 'flex',
                justifyContent: 'center',
                gap: '15px',
                position: 'sticky',
                top: 0,
                zIndex: 50
            }}>
                <button
                    onClick={() => handlePrint('full')}
                    style={{
                        padding: '10px 20px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <span>Print Money Receipt</span>
                </button>
                <button
                    onClick={() => window.close()}
                    style={{
                        padding: '10px 20px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px'
                    }}
                >
                    Close
                </button>
            </div>

            <div style={{
                maxWidth: '210mm',
                margin: '0 auto',
                padding: '30px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontSize: '10pt',
                lineHeight: '1.4',
                color: '#000',
                backgroundColor: '#fff',
                position: 'relative',
                minHeight: '290mm'
            }}>
                {/* Header */}
                <div className={printMode === 'letterhead' ? 'print-hidden-header' : ''} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '30px',
                    paddingBottom: '20px',
                    borderBottom: '2px solid #10b981'
                }}>
                    <div>
                        <div style={{
                            fontSize: '20pt',
                            fontWeight: 'bold',
                            color: '#10b981',
                            marginBottom: '5px'
                        }}>
                            {settings.appName || 'FA CRM'}
                        </div>
                        <div style={{
                            fontSize: '8pt',
                            color: '#6b7280',
                            whiteSpace: 'pre-line'
                        }}>
                            {settings.companyAddress || '4210 Oxygen Chittagong\nChittagong, Bangladesh'}
                            <br />
                            {settings.supportEmail || 'naimursharon@gmail.com'}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{
                            fontSize: '24pt',
                            color: '#10b981',
                            fontWeight: 'bold',
                            marginBottom: '5px'
                        }}>
                            MONEY RECEIPT
                        </div>
                        <div style={{
                            fontSize: '11pt',
                            fontFamily: 'Courier, monospace',
                            marginBottom: '3px'
                        }}>
                            Receipt #{invoice.invoiceNumber}-TXN{transaction.id}
                        </div>
                        <div style={{ fontSize: '9pt', color: '#1a1a1a', fontWeight: 'bold' }}>
                            Date: {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                {/* Received From */}
                <div style={{ marginBottom: '30px' }}>
                    <div style={{
                        fontSize: '9pt',
                        fontWeight: 'bold',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '8px',
                        borderBottom: '1px solid #f3f4f6',
                        paddingBottom: '3px'
                    }}>
                        RECEIVED FROM
                    </div>
                    <div style={{
                        fontSize: '12pt',
                        fontWeight: 'bold',
                        color: '#111827'
                    }}>
                        {clientName}
                    </div>
                    {invoice.client.companyName && (
                        <div style={{ fontSize: '10pt', color: '#4b5563', marginTop: '2px' }}>
                            {invoice.client.companyName}
                        </div>
                    )}
                </div>

                {/* Receipt Description Box */}
                <div style={{
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '30px',
                    border: '1px solid #e5e7eb'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tr>
                            <td style={{ padding: '8px 0', fontSize: '10pt', color: '#4b5563', width: '30%' }}>Payment For:</td>
                            <td style={{ padding: '8px 0', fontSize: '10pt', fontWeight: 'bold' }}>Invoice #{invoice.invoiceNumber}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '8px 0', fontSize: '10pt', color: '#4b5563' }}>Payment Method:</td>
                            <td style={{ padding: '8px 0', fontSize: '10pt', fontWeight: 'bold' }}>{transaction.gateway}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '8px 0', fontSize: '10pt', color: '#4b5563' }}>Transaction ID:</td>
                            <td style={{ padding: '8px 0', fontSize: '10pt', fontFamily: 'Courier, monospace', fontWeight: 'bold' }}>{transaction.transactionId || 'N/A'}</td>
                        </tr>
                        <tr style={{ borderTop: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '15px 0 0 0', fontSize: '12pt', fontWeight: 'bold', color: '#10b981' }}>Amount Received:</td>
                            <td style={{ padding: '15px 0 0 0', fontSize: '16pt', fontWeight: 'bold', color: '#10b981' }}>{formatPrice(transaction.amount)}</td>
                        </tr>
                    </table>
                </div>

                {/* Invoice Items Summary */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={{
                        fontSize: '9pt',
                        fontWeight: 'bold',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '10px'
                    }}>
                        INVOICE BREAKDOWN
                    </div>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        marginBottom: '15px'
                    }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#f3f4f6' }}>
                                <th style={{ padding: '8px', fontSize: '8pt', textAlign: 'left', color: '#374151' }}>Description</th>
                                <th style={{ padding: '8px', fontSize: '8pt', textAlign: 'right', color: '#374151' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map((item: any) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '8px', fontSize: '9pt' }}>{item.description}</td>
                                    <td style={{ padding: '8px', fontSize: '9pt', textAlign: 'right' }}>{formatPrice(item.totalAmount || item.total || (item.quantity * item.unitPrice))}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>


                {/* Footer */}
                <div style={{
                    marginTop: '50px',
                    textAlign: 'center',
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '20px'
                }}>
                    <div style={{ fontSize: '10pt', fontWeight: 'bold', color: '#111827', marginBottom: '5px' }}>
                        Thank you for your payment!
                    </div>
                    <div style={{ fontSize: '8pt', color: '#6b7280' }}>
                        This is a computer-generated money receipt and does not require a physical signature.
                    </div>
                    <div style={{ fontSize: '8pt', color: '#6b7280', marginTop: '5px' }}>
                        Powered by {settings.appName || 'FA CRM'}
                    </div>
                </div>
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
