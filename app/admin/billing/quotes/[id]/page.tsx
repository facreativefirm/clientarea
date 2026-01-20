"use client";

import React, { useState, useEffect } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, ArrowLeft, Loader2, Send, CheckCircle, FileText, XCircle } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { Badge } from "@/components/shared/Badge";

import { useSettingsStore } from "@/lib/store/settingsStore";

export default function EditQuotePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id;
    const { t } = useLanguage();
    const { formatPrice, fetchSettings } = useSettingsStore();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [clients, setClients] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [quote, setQuote] = useState<any>(null);
    const [clientUser, setClientUser] = useState<any>(null);

    // Form State
    const [subject, setSubject] = useState("");
    const [validUntil, setValidUntil] = useState("");
    const [terms, setTerms] = useState("");
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        fetchSettings();
        fetchQuote();

        api.get("/clients").then(res => {
            if (res.data.status === 'success') {
                setClients(res.data.data.clients);
            }
        });

        api.get("/products").then(res => {
            if (res.data.status === 'success') {
                setProducts(res.data.data.products);
            }
        });
    }, []);

    const fetchQuote = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/quotes/${id}`);
            const q = response.data.data.quote;
            setQuote(q);
            setSubject(q.subject || "");
            setValidUntil(q.validUntil ? new Date(q.validUntil).toISOString().split('T')[0] : "");
            setTerms(q.terms || "");
            setNotes(q.notes || "");
            setItems(q.items || []);
            setClientUser(q.client);
        } catch (err) {
            toast.error("Failed to load quote details");
            router.push("/admin/billing/quotes");
        } finally {
            setLoading(false);
        }
    };

    const isEditable = quote?.status === 'DRAFT';

    const addItem = () => {
        setItems([...items, { description: "", quantity: 1, unitPrice: 0, productId: null, billingCycle: "monthly", domainName: "" }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        let updatedItem = { ...newItems[index], [field]: value };

        if (field === 'productId' && value) {
            const product = products.find(p => p.id === parseInt(value));
            if (product) {
                updatedItem.description = product.name;
                updatedItem.productId = parseInt(value);
                const cycle = updatedItem.billingCycle || "monthly";
                updatedItem.unitPrice = getProductPrice(product, cycle);
            }
        } else if (field === 'billingCycle' && updatedItem.productId) {
            const product = products.find(p => p.id === updatedItem.productId);
            if (product) {
                updatedItem.unitPrice = getProductPrice(product, value);
            }
        }

        newItems[index] = updatedItem;
        setItems(newItems);
    };

    const getProductPrice = (product: any, cycle: string) => {
        switch (cycle) {
            case 'monthly': return product.monthlyPrice || 0;
            case 'quarterly': return product.quarterlyPrice || 0;
            case 'semi-annually': return product.semiAnnualPrice || 0;
            case 'annually': return product.annualPrice || 0;
            case 'biennial': return product.biennialPrice || 0;
            case 'triennial': return product.triennialPrice || 0;
            default: return product.monthlyPrice || 0;
        }
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.patch(`/quotes/${id}`, {
                subject,
                validUntil,
                terms,
                notes,
                items: items.map(i => ({
                    description: i.description,
                    quantity: Number(i.quantity),
                    unitPrice: Number(i.unitPrice),
                    productId: i.productId,
                    billingCycle: i.billingCycle,
                    domainName: i.domainName
                }))
            });
            toast.success("Quote updated successfully");
            fetchQuote();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update quote");
        } finally {
            setSaving(false);
        }
    };

    const handleSend = async () => {
        try {
            await api.post(`/quotes/${id}/send`);
            toast.success("Quote marked as SENT and emailed to client");
            fetchQuote(); // Refresh status
        } catch (err) {
            toast.error("Failed to send quote");
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <AuthGuard allowedRoles={["ADMIN", "SUPER_ADMIN", "STAFF"]}>
            <div className="min-h-screen bg-gray-50/50">
                <Navbar />
                <Sidebar />
                <main className="lg:pl-72 pt-20 p-4 md:p-8 max-w-5xl mx-auto space-y-6">
                    {/* Header Actions */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" asChild>
                                <Link href="/admin/billing/quotes"><ArrowLeft size={20} /></Link>
                            </Button>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-gray-900">Quote #{quote.quoteNumber}</h1>
                                    <Badge variant={
                                        quote.status === 'ACCEPTED' ? 'success' :
                                            quote.status === 'REJECTED' ? 'destructive' :
                                                quote.status === 'SENT' ? 'info' : 'secondary'
                                    }>
                                        {quote.status}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-500">Created on {new Date(quote.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {quote.status === 'DRAFT' && (
                                <>
                                    <Button variant="outline" onClick={handleSave} disabled={saving}>
                                        {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                                        Save Changes
                                    </Button>
                                    <Button onClick={handleSend} className="bg-primary text-white hover:bg-primary/90">
                                        <Send className="mr-2" size={16} /> Send to Client
                                    </Button>
                                </>
                            )}
                            {quote.status === 'SENT' && (
                                <Button variant="outline" disabled className="opacity-75">
                                    <CheckCircle className="mr-2" size={16} /> Sent
                                </Button>
                            )}
                            {quote.status === 'ACCEPTED' && quote.invoiceId && (
                                <Button asChild variant="default" className="bg-green-600 hover:bg-green-700">
                                    <Link href={`/admin/billing/invoices`}>
                                        <FileText className="mr-2" size={16} /> View Invoice
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-8">
                        {/* Quote Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Client</Label>
                                <div className="p-3 bg-gray-50 rounded-lg border text-sm font-medium">
                                    {clientUser?.user?.firstName} {clientUser?.user?.lastName} <br />
                                    <span className="text-gray-500 font-normal">{clientUser?.user?.email}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Valid Until</Label>
                                {isEditable ? (
                                    <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
                                ) : (
                                    <div className="p-3 bg-gray-50 rounded-lg border text-sm">{new Date(validUntil).toLocaleDateString()}</div>
                                )}
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label>Subject / Title</Label>
                                {isEditable ? (
                                    <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
                                ) : (
                                    <div className="p-3 bg-gray-50 rounded-lg border text-sm font-bold">{subject}</div>
                                )}
                            </div>
                        </div>

                        {/* Items Section */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 border-b pb-2">Line Items</h3>

                            <div className="space-y-6">
                                {items.map((item, index) => (
                                    <div key={index} className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm relative group/item hover:border-primary/20 transition-colors">
                                        <div className="absolute top-4 right-4 flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Item #{index + 1}</span>
                                            {isEditable && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-8 w-8"
                                                    onClick={() => removeItem(index)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-4">
                                            {/* Top Selection Row */}
                                            <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold text-gray-500 uppercase">Product / Service (Optional)</Label>
                                                    {isEditable ? (
                                                        <select
                                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                            value={item.productId || ""}
                                                            onChange={(e) => updateItem(index, 'productId', e.target.value)}
                                                        >
                                                            <option value="">-- Custom Item --</option>
                                                            {products.map(p => (
                                                                <option key={p.id} value={p.id}>{p.name}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <div className="p-2.5 bg-gray-50 rounded-md border text-sm font-medium">
                                                            {products.find(p => p.id === item.productId)?.name || "Custom Item"}
                                                        </div>
                                                    )}
                                                </div>

                                                {(isEditable && item.productId) || (!isEditable && item.productId) ? (
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-semibold text-gray-500 uppercase">Billing Cycle</Label>
                                                        {isEditable ? (
                                                            <select
                                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                                value={item.billingCycle || "monthly"}
                                                                onChange={(e) => updateItem(index, 'billingCycle', e.target.value)}
                                                            >
                                                                <option value="monthly">Monthly</option>
                                                                <option value="quarterly">Quarterly</option>
                                                                <option value="semi-annually">Semi-Annually</option>
                                                                <option value="annually">Annually</option>
                                                                <option value="biennial">Biennial</option>
                                                                <option value="triennial">Triennial</option>
                                                            </select>
                                                        ) : (
                                                            <div className="p-2.5 bg-gray-50 rounded-md border text-sm capitalize">
                                                                {item.billingCycle || "Monthly"}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : <div className="hidden md:block"></div>}
                                            </div>

                                            {/* Description Row */}
                                            <div className="md:col-span-12 space-y-2">
                                                <Label className="text-xs font-semibold text-gray-500 uppercase">Description / Notes</Label>
                                                {isEditable ? (
                                                    <Input
                                                        placeholder="Enter service details..."
                                                        value={item.description}
                                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                        className="bg-gray-50/30"
                                                    />
                                                ) : (
                                                    <div className="p-3 bg-gray-50 rounded-md border text-sm text-gray-700 min-h-[40px]">
                                                        {item.description}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Footer Row: Domain, Qty, Price, Total */}
                                            <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-dashed border-gray-100 items-end">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold text-gray-500 uppercase">Domain (Optional)</Label>
                                                    {isEditable ? (
                                                        <Input
                                                            placeholder="example.com"
                                                            value={item.domainName || ""}
                                                            onChange={(e) => updateItem(index, 'domainName', e.target.value)}
                                                        />
                                                    ) : (
                                                        <div className="p-2.5 bg-gray-50 rounded-md border text-sm">
                                                            {item.domainName || "-"}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-semibold text-gray-500 uppercase text-center block">Qty</Label>
                                                        {isEditable ? (
                                                            <Input
                                                                type="number"
                                                                value={item.quantity}
                                                                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                                className="text-center"
                                                            />
                                                        ) : (
                                                            <div className="p-2.5 bg-gray-50 rounded-md border text-sm text-center">
                                                                {item.quantity}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-semibold text-gray-500 uppercase text-center block">Unit Price</Label>
                                                        {isEditable ? (
                                                            <Input
                                                                type="number"
                                                                value={item.unitPrice}
                                                                onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                                                                className="text-center"
                                                            />
                                                        ) : (
                                                            <div className="p-2.5 bg-gray-50 rounded-md border text-sm text-center font-mono">
                                                                {formatPrice(item.unitPrice)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="text-right pb-1">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Subtotal</p>
                                                    <p className="text-xl font-bold text-gray-900">
                                                        {formatPrice(item.quantity * item.unitPrice)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {isEditable && (
                                <Button variant="outline" onClick={addItem} className="gap-2">
                                    <Plus size={16} /> Add Another Item
                                </Button>
                            )}

                            <div className="flex justify-end pt-4 border-t">
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Total Amount</p>
                                    <p className="text-2xl font-bold text-primary">{formatPrice(calculateTotal())}</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div className="space-y-2">
                                <Label>Notes</Label>
                                {isEditable ? (
                                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes..." />
                                ) : <div className="p-3 bg-gray-50 rounded-lg border text-sm min-h-[80px]">{notes}</div>}
                            </div>
                            <div className="space-y-2">
                                <Label>Terms</Label>
                                {isEditable ? (
                                    <Textarea value={terms} onChange={(e) => setTerms(e.target.value)} />
                                ) : <div className="p-3 bg-gray-50 rounded-lg border text-sm min-h-[80px]">{terms}</div>}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
