import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Loader2,
    Save,
    Play,
    Globe,
    User,
    Lock,
    Calendar,
    Activity,
    CreditCard,
    HardDrive,
    ExternalLink
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { ClientSelector } from "@/components/shared/ClientSelector";
import { ProductSelector } from "@/components/shared/ProductSelector";
import { ServerSelector } from "@/components/shared/ServerSelector";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { cn, getCurrencySymbol, formatLabel } from "@/lib/utils";

interface ServiceFormProps {
    initialData?: any;
    onSuccess?: (service: any) => void;
    onCancel?: () => void;
    className?: string;
}

export function ServiceForm({ initialData, onSuccess, onCancel, className }: ServiceFormProps) {
    const { t } = useLanguage();
    const { settings, fetchSettings } = useSettingsStore();
    const [loading, setLoading] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const getPriceForCycle = (product: any, cycle: string) => {
        if (!product) return "0.00";
        const prices: Record<string, any> = {
            monthly: product.monthlyPrice,
            quarterly: product.quarterlyPrice,
            "semi-annually": product.semiAnnualPrice,
            annually: product.annualPrice,
            onetime: product.monthlyPrice, // Fallback
        };
        return prices[cycle] || "0.00";
    };

    const handleProductChange = (val: any, product?: any) => {
        setSelectedProduct(product);
        const autoPrice = getPriceForCycle(product, formData.billingCycle);
        setFormData(prev => ({
            ...prev,
            productId: val,
            amount: autoPrice?.toString() !== "0" ? autoPrice?.toString() : prev.amount
        }));
    };

    const handleCycleChange = (val: string) => {
        const autoPrice = getPriceForCycle(selectedProduct, val);
        setFormData(prev => ({
            ...prev,
            billingCycle: val,
            amount: autoPrice?.toString() !== "0" ? autoPrice?.toString() : prev.amount
        }));
    };

    const [formData, setFormData] = useState({
        clientId: initialData?.clientId || "",
        productId: initialData?.productId || "",
        serverId: initialData?.serverId || "",
        domain: initialData?.domain || "",
        billingCycle: initialData?.billingCycle || "monthly",
        status: initialData?.status || "PENDING",
        amount: initialData?.amount || "0.00",
        nextDueDate: initialData?.nextDueDate ? initialData.nextDueDate.split('T')[0] : "",
        username: initialData?.username || "",
        password: "",
        ipAddress: initialData?.ipAddress || "",
        controlPanelUrl: initialData?.controlPanelUrl || "",
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.clientId) return toast.error("Select a client");
        if (!formData.productId) return toast.error("Select a product");

        setLoading(true);
        try {
            const payload = {
                ...formData,
                clientId: parseInt(formData.clientId as string),
                productId: parseInt(formData.productId as string),
                serverId: formData.serverId ? parseInt(formData.serverId as string) : null,
                amount: parseFloat(formData.amount as string),
                nextDueDate: formData.nextDueDate ? new Date(formData.nextDueDate) : null,
            };

            let response: any;
            if (initialData?.id) {
                response = await api.patch(`/services/${initialData.id}`, payload);
                toast.success("Service updated");
            } else {
                response = await api.post("/services", payload);
                const { invoice } = response.data.data;

                toast.success("Service Setup Successfully. Invoice Generated.", {
                    action: {
                        label: 'View Invoice',
                        onClick: () => window.location.href = `/admin/billing/${invoice?.id}`
                    }
                });
            }

            if (onSuccess && response?.data?.data?.service) {
                onSuccess(response.data.data.service);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSave} className={cn("space-y-10", className)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                {/* section: Client & Product */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2 text-primary">
                        <User size={18} />
                        <h3 className="font-bold uppercase tracking-widest text-xs">Core Association</h3>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Client</Label>
                        <ClientSelector
                            value={formData.clientId}
                            onChange={(val) => setFormData({ ...formData, clientId: val })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Product</Label>
                        <ProductSelector
                            value={formData.productId}
                            onChange={handleProductChange}
                        />
                    </div>
                </div>

                {/* section: Status & Cycle */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2 text-primary">
                        <Activity size={18} />
                        <h3 className="font-bold uppercase tracking-widest text-xs">Lifecycle & Details</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Billing Cycle</Label>
                            <Select value={formData.billingCycle} onValueChange={handleCycleChange}>
                                <SelectTrigger className="h-12 border-none bg-secondary/30 rounded-xl font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="quarterly">Quarterly</SelectItem>
                                    <SelectItem value="semi-annually">Semi-Annually</SelectItem>
                                    <SelectItem value="annually">Annually</SelectItem>
                                    <SelectItem value="onetime">One Time</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Status is now hidden for creation - defaults to PENDING */}
                        {initialData?.id && (
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Service Status</Label>
                                <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                                    <SelectTrigger className="h-12 border-none bg-secondary/30 rounded-xl font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PENDING">Pending</SelectItem>
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="SUSPENDED">Suspended</SelectItem>
                                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                        <SelectItem value="TERMINATED">Terminated</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Price ({getCurrencySymbol(settings.defaultCurrency || 'BDT')})</Label>
                            <div className="relative">
                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="number"
                                    step="0.01"
                                    className="pl-12 h-12 rounded-xl bg-secondary/30 border-none font-bold"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Next Due Date</Label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="date"
                                    className="pl-12 h-12 rounded-xl bg-secondary/30 border-none font-bold"
                                    value={formData.nextDueDate}
                                    onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-1 md:col-span-2 border-t border-white/5 pt-8">
                    <div className="flex items-center gap-2 mb-2 text-primary">
                        <HardDrive size={18} />
                        <h3 className="font-bold uppercase tracking-widest text-xs">Login & Account Details</h3>
                    </div>
                </div>

                {/* Provisioning Credentials */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Domain Name</Label>
                        <div className="relative">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="example.com"
                                className="pl-12 h-12 rounded-xl bg-secondary/30 border-none font-bold"
                                value={formData.domain}
                                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                            />
                        </div>
                    </div>
                    {/* <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Assigned Server</Label>
                        <ServerSelector
                            value={formData.serverId}
                            onChange={(val) => setFormData({ ...formData, serverId: val })}
                        />
                    </div> */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Username</Label>
                        <Input
                            className="h-12 rounded-xl bg-secondary/30 border-none font-bold"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="password"
                                className="pl-12 h-12 rounded-xl bg-secondary/30 border-none font-bold"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Dedicated IP Address</Label>
                        <Input
                            placeholder="0.0.0.0"
                            className="h-12 rounded-xl bg-secondary/30 border-none font-bold"
                            value={formData.ipAddress}
                            onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                        />
                    </div>


                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Control Panel URL (Override)</Label>
                        <div className="relative">
                            <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="https://cpanel.example.com"
                                className="pl-12 h-12 rounded-xl bg-secondary/30 border-none font-bold"
                                value={formData.controlPanelUrl}
                                onChange={(e) => setFormData({ ...formData, controlPanelUrl: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
                {onCancel && (
                    <Button type="button" variant="ghost" onClick={onCancel} className="h-12 px-6 font-bold rounded-xl hover:bg-secondary">
                        Discard
                    </Button>
                )}
                <Button type="submit" disabled={loading} className="h-12 px-10 rounded-xl font-bold shadow-xl shadow-primary/20 gap-2">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : (initialData?.id ? <Save size={18} /> : <Play size={18} />)}
                    {initialData?.id ? "Save Changes" : "Setup Service"}
                </Button>
            </div>
        </form >
    );
}
