"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { useSettingsStore } from "@/lib/store/settingsStore";

export default function InvoicePrintPage() {
    const params = useParams();
    const router = useRouter();
    const { settings, fetchSettings, formatPrice } = useSettingsStore();
    const [invoice, setInvoice] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [printMode, setPrintMode] = useState<'full' | 'letterhead'>('full');

    useEffect(() => {
        fetchSettings();
        fetchInvoice();
    }, [params.id]);

    const fetchInvoice = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/invoices/${params.id}`);
            if (response.data.status === 'success') {
                setInvoice(response.data.data.invoice);
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

    if (loading || !invoice) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontFamily: 'Arial, sans-serif'
            }}>
                Loading invoice...
            </div>
        );
    }

    const clientName = invoice.client.user ? `${invoice.client.user.firstName} ${invoice.client.user.lastName}` : (invoice.client.companyName || 'Valued Client');

    return (
        <>
            {/* Print Options Toolbar */}
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
                        background: '#3b82f6',
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
                    <span>Print (Plain Paper)</span>
                </button>
                <button
                    onClick={() => handlePrint('letterhead')}
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
                    <span>Print (Letterhead)</span>
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
                lineHeight: '1.3',
                color: '#000',
                backgroundColor: '#fff',
                marginBottom: '50px'
            }}>
                {/* Header */}
                <div className={printMode === 'letterhead' ? 'print-hidden-header' : ''} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '15px',
                    paddingBottom: '15px',
                    borderBottom: '1px solid #e5e7eb'
                }}>
                    <div>
                        <div style={{
                            fontSize: '18pt',
                            fontWeight: 'bold',
                            color: '#3b82f6',
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
                            color: '#3b82f6',
                            marginBottom: '5px'
                        }}>
                            INVOICE
                        </div>
                        <div style={{
                            fontSize: '11pt',
                            fontFamily: 'Courier, monospace',
                            marginBottom: '3px'
                        }}>
                            #{invoice.invoiceNumber || invoice.id}
                        </div>
                        <div style={{ fontSize: '8pt', color: '#6b7280' }}>
                            Date: {new Date(invoice.invoiceDate || invoice.createdAt).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: '8pt', color: '#6b7280' }}>
                            Due Date: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                        </div>
                    </div>
                </div>

                {/* Client Information */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={{
                        fontSize: '8pt',
                        fontWeight: 'bold',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '5px'
                    }}>
                        BILL TO
                    </div>
                    <div style={{
                        fontSize: '11pt',
                        fontWeight: 'bold',
                        marginBottom: '2px'
                    }}>
                        {clientName}
                    </div>
                    {invoice.client.companyName && (
                        <div style={{ fontSize: '8pt', color: '#1a1a1a' }}>
                            {invoice.client.companyName}
                        </div>
                    )}
                </div>

                {/* Items Table */}
                <table style={{
                    width: '100%',
                    marginBottom: '15px',
                    borderCollapse: 'collapse'
                }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <th style={{
                                padding: '5px 0',
                                fontSize: '8pt',
                                fontWeight: 'bold',
                                color: '#6b7280',
                                textAlign: 'left',
                                width: '50%'
                            }}>
                                Description
                            </th>
                            <th style={{
                                padding: '5px 0',
                                fontSize: '8pt',
                                fontWeight: 'bold',
                                color: '#6b7280',
                                textAlign: 'center',
                                width: '15%'
                            }}>
                                Qty
                            </th>
                            <th style={{
                                padding: '5px 0',
                                fontSize: '8pt',
                                fontWeight: 'bold',
                                color: '#6b7280',
                                textAlign: 'right',
                                width: '17.5%'
                            }}>
                                Unit Price
                            </th>
                            <th style={{
                                padding: '5px 0',
                                fontSize: '8pt',
                                fontWeight: 'bold',
                                color: '#6b7280',
                                textAlign: 'right',
                                width: '17.5%'
                            }}>
                                Total
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item: any) => (
                            <tr key={item.id} style={{ borderBottom: '0.5px solid #f3f4f6' }}>
                                <td style={{ padding: '5px 0', fontSize: '9pt' }}>
                                    {item.description}
                                </td>
                                <td style={{ padding: '5px 0', fontSize: '9pt', textAlign: 'center' }}>
                                    {item.quantity}
                                </td>
                                <td style={{ padding: '5px 0', fontSize: '9pt', textAlign: 'right' }}>
                                    {formatPrice(item.unitPrice)}
                                </td>
                                <td style={{ padding: '5px 0', fontSize: '9pt', textAlign: 'right', fontWeight: 'bold' }}>
                                    {formatPrice(item.totalAmount || item.total || (item.quantity * item.unitPrice))}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <div style={{ width: '40%' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '3px 0',
                            fontSize: '9pt',
                            color: '#6b7280'
                        }}>
                            <span>Subtotal</span>
                            <span>{formatPrice(invoice.subtotal)}</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '3px 0',
                            fontSize: '9pt',
                            color: '#6b7280'
                        }}>
                            <span>Tax</span>
                            <span>{formatPrice(invoice.tax || 0)}</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '8px 0',
                            paddingTop: '8px',
                            borderTop: '1px solid #e5e7eb',
                            fontSize: '11pt',
                            fontWeight: 'bold'
                        }}>
                            <span style={{ color: '#1a1a1a' }}>Total</span>
                            <span style={{ color: '#3b82f6' }}>{formatPrice(invoice.totalAmount)}</span>
                        </div>
                        {invoice.status === 'PAID' && (
                            <div style={{
                                marginTop: '10px',
                                textAlign: 'right'
                            }}>
                                <span style={{
                                    fontSize: '8pt',
                                    fontWeight: 'bold',
                                    color: '#10b981',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1.5px',
                                    border: '1px solid #10b981',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: '#f0fdf4'
                                }}>
                                    PAID IN FULL
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Notes */}
                {invoice.notes && (
                    <div style={{
                        marginTop: '20px',
                        paddingTop: '10px',
                        borderTop: '1px solid #e5e7eb'
                    }}>
                        <div style={{
                            fontSize: '9pt',
                            fontWeight: 'bold',
                            marginBottom: '3px'
                        }}>
                            Notes
                        </div>
                        <div style={{
                            fontSize: '9pt',
                            color: '#6b7280',
                            whiteSpace: 'pre-wrap'
                        }}>
                            {invoice.notes}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div style={{
                    marginTop: '20px',
                    textAlign: 'center',
                    fontSize: '7pt',
                    color: '#9ca3af',
                    position: 'absolute',
                    bottom: '20px',
                    left: 0,
                    right: 0
                }}>
                    <div>Thank you for your business.</div>
                    <div>Generated by {settings.appName || 'FA CRM'}</div>
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
