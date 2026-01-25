import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    User,
    Building,
    Save,
    Loader2,
    Globe,
    FileText,
    CreditCard
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface ClientFormProps {
    initialData?: any;
    onSuccess?: (client: any) => void;
    onCancel?: () => void;
    className?: string;
}

export function ClientForm({ initialData, onSuccess, onCancel, className }: ClientFormProps) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [groups, setGroups] = useState<any[]>([]);
    const [currencies, setCurrencies] = useState<any[]>([]);

    const primaryContact = initialData?.contacts?.find((c: any) => c.isPrimary) || initialData?.contacts?.[0];

    const [form, setForm] = useState({
        firstName: initialData?.user?.firstName || "",
        lastName: initialData?.user?.lastName || "",
        email: initialData?.user?.email || "",
        companyName: initialData?.companyName || "",
        businessType: initialData?.businessType || "",
        taxId: initialData?.taxId || "",
        currency: initialData?.currency || "BDT",
        groupId: initialData?.groupId?.toString() || "",
        notes: initialData?.notes || "",
        address1: primaryContact?.address1 || "",
        address2: primaryContact?.address2 || "",
        city: primaryContact?.city || "",
        state: primaryContact?.state || "",
        postcode: primaryContact?.zip || "",
        country: primaryContact?.country || "BD",
        phoneNumber: initialData?.user?.phoneNumber || primaryContact?.phone || "",
        whatsAppNumber: initialData?.user?.whatsAppNumber || "",
        password: "",
        status: initialData?.status || "ACTIVE"
    });

    useEffect(() => {
        fetchOptions();
    }, []);

    const fetchOptions = async () => {
        try {
            const [groupRes, currRes] = await Promise.all([
                api.get('/client-groups'),
                api.get('/finance/currencies')
            ]);
            setGroups(groupRes.data.data.groups || []);
            setCurrencies(currRes.data.data.currencies || []);
        } catch (error) {
            console.error("Failed to fetch form options", error);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload: any = {
                ...form,
                phone: form.phoneNumber,
                zip: form.postcode,
                groupId: form.groupId ? parseInt(form.groupId) : null
            };

            if (!initialData) {
                // Registering new client
                payload.username = form.email.split('@')[0] + Math.floor(Math.random() * 1000);
                const response = await api.post("/clients/register", payload);
                toast.success("Client added successfully");
                if (onSuccess) onSuccess(response.data.data?.client);
            } else {
                // Updating existing client
                const response = await api.patch(`/clients/${initialData.id}`, payload);
                toast.success("Client updated successfully");
                if (onSuccess) onSuccess(response.data.data?.client);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save client");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSave} className={`space-y-8 ${className}`}>
            {/* Personal Information */}
            <div className="space-y-6 p-6 bg-secondary/10 rounded-3xl border border-border/50">
                <h3 className="text-xl font-black flex items-center gap-2">
                    <User className="text-primary" size={20} />
                    Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">First Name</Label>
                        <Input
                            required
                            value={form.firstName}
                            onChange={e => setForm({ ...form, firstName: e.target.value })}
                            className="h-12 rounded-xl bg-background border-border font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Last Name</Label>
                        <Input
                            required
                            value={form.lastName}
                            onChange={e => setForm({ ...form, lastName: e.target.value })}
                            className="h-12 rounded-xl bg-background border-border font-bold"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                    <Input
                        required
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        className="h-12 rounded-xl bg-background border-border font-bold"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</Label>
                        <Input
                            value={form.phoneNumber}
                            onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                            className="h-12 rounded-xl bg-background border-border font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">WhatsApp Number</Label>
                        <Input
                            value={form.whatsAppNumber}
                            onChange={e => setForm({ ...form, whatsAppNumber: e.target.value })}
                            className="h-12 rounded-xl bg-background border-border font-bold"
                            placeholder="+8801700000000"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Status</Label>
                        <select
                            value={form.status}
                            onChange={e => setForm({ ...form, status: e.target.value })}
                            className="w-full h-12 rounded-xl bg-background border-border font-bold px-3 outline-none appearance-none"
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                            <option value="CLOSED">Closed</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
                        <Input
                            required={!initialData}
                            type="password"
                            placeholder={initialData ? "Leave blank to keep current" : "Enter secure password"}
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            className="h-12 rounded-xl bg-background border-border font-bold"
                        />
                    </div>
                </div>
            </div>

            {/* Corporate & Identity Details */}
            <div className="space-y-6 p-6 bg-secondary/10 rounded-3xl border border-border/50">
                <h3 className="text-xl font-black flex items-center gap-2">
                    <Building className="text-primary" size={20} />
                    Corporate Details
                </h3>
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Company Name</Label>
                    <Input
                        value={form.companyName}
                        onChange={e => setForm({ ...form, companyName: e.target.value })}
                        className="h-12 rounded-xl bg-background border-border font-bold"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Business Type</Label>
                        <Input
                            placeholder="e.g. Individual, PLC, LLC"
                            value={form.businessType}
                            onChange={e => setForm({ ...form, businessType: e.target.value })}
                            className="h-12 rounded-xl bg-background border-border font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tax ID / VAT Number</Label>
                        <Input
                            value={form.taxId}
                            onChange={e => setForm({ ...form, taxId: e.target.value })}
                            className="h-12 rounded-xl bg-background border-border font-bold"
                        />
                    </div>
                </div>
            </div>

            {/* System Preferences */}
            <div className="space-y-6 p-6 bg-secondary/10 rounded-3xl border border-border/50">
                <h3 className="text-xl font-black flex items-center gap-2">
                    <CreditCard className="text-primary" size={20} />
                    System Preferences & Billing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Default Currency</Label>
                        <select
                            value={form.currency}
                            onChange={e => setForm({ ...form, currency: e.target.value })}
                            className="w-full h-12 rounded-xl bg-background border-border font-bold px-3 outline-none appearance-none"
                        >
                            {currencies.map(curr => (
                                <option key={curr.code} value={curr.code}>{curr.code} - {curr.prefix || curr.suffix}</option>
                            ))}
                            {currencies.length === 0 && <option value="BDT">BDT</option>}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Client Group</Label>
                        <select
                            value={form.groupId}
                            onChange={e => setForm({ ...form, groupId: e.target.value })}
                            className="w-full h-12 rounded-xl bg-background border-border font-bold px-3 outline-none appearance-none"
                        >
                            <option value="">None (General)</option>
                            {groups.map(group => (
                                <option key={group.id} value={group.id}>{group.groupName}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Address Details */}
            <div className="space-y-6 p-6 bg-secondary/10 rounded-3xl border border-border/50">
                <h3 className="text-xl font-black flex items-center gap-2">
                    <Globe className="text-primary" size={20} />
                    Address Details
                </h3>
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Address Line 1</Label>
                    <Input
                        value={form.address1}
                        onChange={e => setForm({ ...form, address1: e.target.value })}
                        className="h-12 rounded-xl bg-background border-border font-bold"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">City</Label>
                        <Input
                            value={form.city}
                            onChange={e => setForm({ ...form, city: e.target.value })}
                            className="h-12 rounded-xl bg-background border-border font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">State/Region</Label>
                        <Input
                            value={form.state}
                            onChange={e => setForm({ ...form, state: e.target.value })}
                            className="h-12 rounded-xl bg-background border-border font-bold"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Postcode</Label>
                        <Input
                            value={form.postcode}
                            onChange={e => setForm({ ...form, postcode: e.target.value })}
                            className="h-12 rounded-xl bg-background border-border font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Country</Label>
                        <Input
                            value={form.country}
                            onChange={e => setForm({ ...form, country: e.target.value })}
                            className="h-12 rounded-xl bg-background border-border font-bold"
                        />
                    </div>
                </div>
            </div>

            {/* Notes */}
            <div className="space-y-6 p-6 bg-secondary/10 rounded-3xl border border-border/50">
                <h3 className="text-xl font-black flex items-center gap-2">
                    <FileText className="text-primary" size={20} />
                    Admin Notes
                </h3>
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Internal Notes (Visible only to Admins)</Label>
                    <Textarea
                        value={form.notes}
                        onChange={e => setForm({ ...form, notes: e.target.value })}
                        className="min-h-[120px] rounded-2xl bg-background border-border font-medium"
                        placeholder="Add private notes about this client..."
                    />
                </div>
            </div>

            <div className="flex justify-end gap-4">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} className="h-14 px-8 rounded-2xl font-bold">
                        Cancel
                    </Button>
                )}
                <Button
                    type="submit"
                    disabled={loading}
                    className="h-14 px-10 rounded-2xl font-bold shadow-xl shadow-primary/20 gap-2 text-lg"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Save Client
                </Button>
            </div>
        </form>
    );
}
