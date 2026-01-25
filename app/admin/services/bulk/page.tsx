"use client";

import React, { useState, useEffect } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, Server, Save, User } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import api from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function BulkSetupPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string>("");

    // Bulk Items State
    const [items, setItems] = useState<{
        productId: string;
        domain: string;
        billingCycle: string;
        priceOverride: string;
        registerDomain?: boolean;
    }[]>([
        { productId: "", domain: "", billingCycle: "monthly", priceOverride: "", registerDomain: false }
    ]);

    const [tlds, setTlds] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [clientsRes, productsRes, tldsRes] = await Promise.all([
                api.get("/clients"),
                api.get("/products"),
                api.get("/domains/tlds")
            ]);
            setClients(clientsRes.data.data.clients || []);
            setProducts(productsRes.data.data.products || []);
            setTlds(tldsRes.data.data.tlds || []);
        } catch (error) {
            console.error("Failed to fetch initial data", error);
            toast.error("Failed to load data");
        }
    };

    const addItem = () => {
        setItems([...items, { productId: "", domain: "", billingCycle: "monthly", priceOverride: "", registerDomain: false }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            const newItems = [...items];
            newItems.splice(index, 1);
            setItems(newItems);
        }
    };

    const calculatePrice = (product: any, cycle: string) => {
        if (!product) return 0;
        switch (cycle) {
            case 'monthly': return product.monthlyPrice;
            case 'quarterly': return product.quarterlyPrice;
            case 'semi_annually': return product.semiAnnualPrice;
            case 'annually': return product.annualPrice;
            case 'biennially': return product.biennialPrice;
            case 'triennially': return product.triennialPrice;
            default: return product.monthlyPrice;
        }
    };

    const getDomainPrice = (domainName: string) => {
        if (!domainName) return 0;
        const extension = domainName.split('.').pop();
        if (!extension) return 0;

        const tld = tlds.find(t => t.tld === '.' + extension || t.tld === extension);
        return tld ? tld.registrationPrice : 0;
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        const item = { ...newItems[index], [field]: value };

        // Auto-update price when product or cycle changes
        if (field === 'productId' || field === 'billingCycle') {
            const product = products.find(p => p.id === parseInt(item.productId));
            if (product) {
                const price = calculatePrice(product, item.billingCycle);
                item.priceOverride = price ? price.toString() : "0.00";
            }
        }

        // Auto-calc domain price if registering
        if (field === 'domain' || field === 'registerDomain') {
            // Logic could go here if we had a specific domain price field, 
            // but current backend only takes one priceOverride for service?
            // Actually backend needs update to handle domain charging.
            // For now user asked for frontend changes. 
            // We'll trust backend handles it or we sum it up?
            // "remains editable" implies we assume the priceOverride is for the SERVICE.
            // We'll separate logic.
        }

        newItems[index] = item;
        setItems(newItems);
    };

    const handleSubmit = async () => {
        if (!selectedClientId) {
            toast.error("Please select a client first");
            return;
        }

        // Validate items
        for (let i = 0; i < items.length; i++) {
            if (!items[i].productId) {
                toast.error(`Please select a product for Item #${i + 1}`);
                return;
            }
        }

        setLoading(true);
        try {
            const payload = {
                clientId: parseInt(selectedClientId),
                items: items.map(item => ({
                    productId: parseInt(item.productId),
                    domain: item.domain || null,
                    billingCycle: item.billingCycle,
                    priceOverride: item.priceOverride ? parseFloat(item.priceOverride) : null,
                    registerDomain: (item as any).registerDomain || false
                }))
            };

            await api.post("/services/bulk-provision", payload);
            toast.success("Bulk Services Setup Successfully! Invoice Created.");
            router.push("/admin/services");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to Setup Services");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
                <Navbar />
                <Sidebar />
                <main className="lg:pl-72 pt-20 p-4 md:p-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight">Bulk Setup</h1>
                            <p className="text-muted-foreground mt-1 font-medium">Setup multiple services at once and generate a consolidated invoice.</p>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-8 shadow-sm">
                        {/* Client Selection */}
                        <div className="max-w-md space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select Client</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <select
                                    className="w-full h-11 pl-10 pr-4 bg-secondary/20 border-border rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                                    value={selectedClientId}
                                    onChange={(e) => setSelectedClientId(e.target.value)}
                                >
                                    <option value="">-- Choose a Client --</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>
                                            {client.user?.firstName} {client.user?.lastName} ({client.companyName || client.user?.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-border pb-2">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Server size={18} className="text-primary" />
                                    Service Items
                                </h3>
                                <Button size="sm" variant="outline" onClick={addItem} className="gap-2 font-bold rounded-lg">
                                    <Plus size={14} /> Add Another Item
                                </Button>
                            </div>

                            {items.map((item, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-secondary/10 rounded-xl border border-white/5 items-end animate-in fade-in slide-in-from-left-4 duration-300">
                                    <div className="md:col-span-3 space-y-1">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Product</Label>
                                        <select
                                            className="w-full h-10 px-3 bg-background border-border rounded-lg text-sm font-medium"
                                            value={item.productId}
                                            onChange={(e) => updateItem(index, 'productId', e.target.value)}
                                        >
                                            <option value="">Select Product...</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} ({p.pricingModel})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-3 space-y-1">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Domain (Optional)</Label>
                                        <div className="space-y-2">
                                            <Input
                                                className="h-10 bg-background border-border"
                                                placeholder="example.com"
                                                value={item.domain}
                                                onChange={(e) => updateItem(index, 'domain', e.target.value)}
                                            />
                                            {item.domain && (
                                                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={(item as any).registerDomain || false}
                                                        onChange={(e) => updateItem(index, 'registerDomain', e.target.checked)}
                                                        className="w-3.5 h-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                    Register Domain {((item as any).registerDomain && getDomainPrice(item.domain) > 0) && <span className="text-primary">(${getDomainPrice(item.domain)})</span>}
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-1">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Billing Cycle</Label>
                                        <select
                                            className="w-full h-10 px-3 bg-background border-border rounded-lg text-sm font-medium"
                                            value={item.billingCycle}
                                            onChange={(e) => updateItem(index, 'billingCycle', e.target.value)}
                                        >
                                            <option value="monthly">Monthly</option>
                                            <option value="quarterly">Quarterly</option>
                                            <option value="semi_annually">Semi-Annually</option>
                                            <option value="annually">Annually</option>
                                            <option value="biennially">Biennially</option>
                                            <option value="triennially">Triennially</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2 space-y-1">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Service Price</Label>
                                        <Input
                                            className="h-10 bg-background border-border"
                                            placeholder="0.00"
                                            type="number"
                                            step="0.01"
                                            value={item.priceOverride}
                                            onChange={(e) => updateItem(index, 'priceOverride', e.target.value)}
                                        />
                                    </div>
                                    <div className="md:col-span-1 flex justify-end">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem(index)}
                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            disabled={items.length === 1}
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end pt-4 border-t border-border">
                            <Button
                                size="lg"
                                className="font-bold text-lg h-12 px-8 rounded-xl shadow-xl shadow-primary/20 gap-2"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                Setup Services & Create Invoice
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
