import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Define styles for the PDF
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: 'Helvetica',
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        paddingBottom: 15,
        borderBottom: '1px solid #e5e7eb',
    },
    companyInfo: {
        flexDirection: 'column',
    },
    companyName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3b82f6',
        marginBottom: 5,
    },
    companyDetails: {
        fontSize: 8,
        color: '#6b7280',
        lineHeight: 1.3,
    },
    invoiceTitle: {
        fontSize: 24,
        color: '#60a5fa',
        marginBottom: 5,
        textAlign: 'right',
    },
    invoiceNumber: {
        fontSize: 11,
        fontFamily: 'Courier',
        marginBottom: 3,
        textAlign: 'right',
    },
    invoiceDate: {
        fontSize: 8,
        color: '#6b7280',
        textAlign: 'right',
    },
    clientSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 5,
    },
    clientName: {
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    clientDetails: {
        fontSize: 8,
        color: '#1a1a1a',
        lineHeight: 1.3,
    },
    table: {
        marginBottom: 15,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: 5,
        marginBottom: 5,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 5,
        borderBottom: '0.5px solid #f3f4f6',
    },
    tableColDescription: {
        width: '50%',
        fontSize: 9,
    },
    tableColQty: {
        width: '15%',
        fontSize: 9,
        textAlign: 'center',
    },
    tableColPrice: {
        width: '17.5%',
        fontSize: 9,
        textAlign: 'right',
    },
    tableColTotal: {
        width: '17.5%',
        fontSize: 9,
        textAlign: 'right',
        fontWeight: 'bold',
    },
    headerText: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#6b7280',
    },
    totalsSection: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    totalsBox: {
        width: '40%',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 3,
        fontSize: 9,
        color: '#6b7280',
    },
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
        paddingTop: 8,
        borderTop: '1px solid #e5e7eb',
        fontSize: 11,
        fontWeight: 'bold',
    },
    grandTotalLabel: {
        color: '#1a1a1a',
    },
    grandTotalAmount: {
        color: '#3b82f6',
    },
    notesSection: {
        marginTop: 20,
        paddingTop: 10,
        borderTop: '1px solid #e5e7eb',
    },
    notesTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        marginBottom: 3,
    },
    notesText: {
        fontSize: 8,
        color: '#6b7280',
        lineHeight: 1.3,
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 7,
        color: '#9ca3af',
    },
});

interface InvoiceItem {
    id: number;
    description: string;
    quantity: number;
    unitPrice: number;
    total?: number;
}

interface InvoiceData {
    id: number;
    invoiceNumber: string;
    date: string;
    dueDate: string;
    status: string;
    subtotal: number;
    tax?: number;
    totalAmount: number;
    notes?: string;
    client: {
        firstName: string;
        lastName: string;
        email: string;
        companyName?: string;
        address?: string;
        city?: string;
        country?: string;
    };
    items: InvoiceItem[];
}

interface InvoicePDFProps {
    invoice: InvoiceData;
    appName?: string;
    companyAddress?: string;
    supportEmail?: string;
    currencyCode?: string;
    taxName?: string;
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, appName = 'FA CRM', companyAddress, supportEmail, currencyCode = 'USD', taxName = 'Tax' }) => {
    const formatValue = (amount: number | string) => {
        const value = Number(amount).toFixed(2);
        const symbols: Record<string, string> = {
            'BDT': 'Taka', // Use text instead of symbol for better PDF font support
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
        };
        const symbol = symbols[currencyCode] || currencyCode;
        return `${symbol} ${value}`;
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.companyInfo}>
                        <Text style={styles.companyName}>{appName}</Text>
                        <View style={styles.companyDetails}>
                            {companyAddress ? (
                                <Text>{companyAddress}</Text>
                            ) : (
                                <>
                                    <Text>4210 Oxygen Chittagong</Text>
                                    <Text>Chittagong, Bangladesh</Text>
                                </>
                            )}
                            <Text>{supportEmail || 'naimursharon@gmail.com'}</Text>
                        </View>
                    </View>
                    <View>
                        <Text style={styles.invoiceTitle}>INVOICE</Text>
                        <Text style={styles.invoiceNumber}>#{invoice.invoiceNumber || invoice.id}</Text>
                        <Text style={styles.invoiceDate}>
                            Date: {new Date((invoice as any).invoiceDate || (invoice as any).createdAt || invoice.date).toLocaleDateString()}
                        </Text>
                        <Text style={styles.invoiceDate}>
                            Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                        </Text>
                    </View>
                </View>

                {/* Client Information */}
                <View style={styles.clientSection}>
                    <Text style={styles.sectionTitle}>BILL TO</Text>
                    <Text style={styles.clientName}>
                        {invoice.client.firstName} {invoice.client.lastName}
                    </Text>
                    {invoice.client.companyName && (
                        <Text style={styles.clientDetails}>{invoice.client.companyName}</Text>
                    )}
                    {/* Compact address info removed to save space similar to Quotes */}
                </View>

                {/* Items Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableColDescription, styles.headerText]}>Description</Text>
                        <Text style={[styles.tableColQty, styles.headerText]}>Qty</Text>
                        <Text style={[styles.tableColPrice, styles.headerText]}>Unit Price</Text>
                        <Text style={[styles.tableColTotal, styles.headerText]}>Total</Text>
                    </View>
                    {invoice.items.map((item) => (
                        <View key={item.id} style={styles.tableRow}>
                            <Text style={styles.tableColDescription}>{item.description}</Text>
                            <Text style={styles.tableColQty}>{item.quantity}</Text>
                            <Text style={styles.tableColPrice}>{formatValue(item.unitPrice)}</Text>
                            <Text style={styles.tableColTotal}>
                                {formatValue(item.total || (item.quantity * item.unitPrice))}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Totals */}
                <View style={styles.totalsSection}>
                    <View style={styles.totalsBox}>
                        <View style={styles.totalRow}>
                            <Text>Subtotal</Text>
                            <Text>{formatValue(invoice.subtotal)}</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text>{taxName}</Text>
                            <Text>{formatValue(invoice.tax || 0)}</Text>
                        </View>
                        <View style={styles.grandTotalRow}>
                            <Text style={styles.grandTotalLabel}>Total</Text>
                            <Text style={styles.grandTotalAmount}>{formatValue(invoice.totalAmount)}</Text>
                        </View>
                    </View>
                </View>

                {/* Notes */}
                {invoice.notes && (
                    <View style={styles.notesSection}>
                        <Text style={styles.notesTitle}>Notes</Text>
                        <Text style={styles.notesText}>{invoice.notes}</Text>
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Thank you for your business.</Text>
                    <Text>Generated by {appName}</Text>
                </View>
            </Page>
        </Document>
    );
};
