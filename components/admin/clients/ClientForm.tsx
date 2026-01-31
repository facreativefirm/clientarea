import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    User,
    Building,
    Save,
    Loader2,
    Globe,
    FileText,
    CreditCard,
    Briefcase,
    MapPin,
    Lock,
    X
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { PasswordStrength } from "@/components/shared/PasswordStrength";

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

            // Strong Password Validation logic
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
            if (form.password && form.password.trim() !== '' && !passwordRegex.test(form.password)) {
                toast.error("Weak Password: Must be 8+ chars with a Capital letter, Number, and Symbol.");
                setLoading(false);
                return;
            }

            // Remove empty password if updating
            if (initialData && (!form.password || form.password.trim() === '')) {
                delete payload.password;
            }

            if (!initialData) {
                // Registering new client
                payload.username = form.email.split('@')[0] + Math.floor(1000 + Math.random() * 9000);
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
        <div className={`p-8 bg-card/10 backdrop-blur-2xl ${className}`}>
            <form onSubmit={handleSave} className="space-y-8">
                <Tabs defaultValue="personal" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 lg:max-w-3xl mb-10 bg-secondary/20 p-1 rounded-2xl h-auto">
                        <TabsTrigger value="personal" className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                            <User size={16} /> <span className="hidden md:inline">Personal</span>
                        </TabsTrigger>
                        <TabsTrigger value="business" className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                            <Briefcase size={16} /> <span className="hidden md:inline">Business</span>
                        </TabsTrigger>
                        <TabsTrigger value="address" className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                            <MapPin size={16} /> <span className="hidden md:inline">Address</span>
                        </TabsTrigger>
                        <TabsTrigger value="other" className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                            <FileText size={16} /> <span className="hidden md:inline">Admin</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Personal Tab */}
                    <TabsContent value="personal" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">First Name</Label>
                                <Input
                                    required
                                    value={form.firstName}
                                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                                    className="h-12 rounded-xl bg-background/50 border-white/10 font-medium focus:ring-primary/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Last Name</Label>
                                <Input
                                    required
                                    value={form.lastName}
                                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                                    className="h-12 rounded-xl bg-background/50 border-white/10 font-medium focus:ring-primary/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                                <Input
                                    required
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    className="h-12 rounded-xl bg-background/50 border-white/10 font-medium focus:ring-primary/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                                <Input
                                    value={form.phoneNumber}
                                    onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                                    className="h-12 rounded-xl bg-background/50 border-white/10 font-medium focus:ring-primary/20"
                                    placeholder="+1..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">WhatsApp Number</Label>
                                <Input
                                    value={form.whatsAppNumber}
                                    onChange={e => setForm({ ...form, whatsAppNumber: e.target.value })}
                                    className="h-12 rounded-xl bg-background/50 border-white/10 font-medium focus:ring-primary/20"
                                    placeholder="+8801700000000"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Account Status</Label>
                                <select
                                    value={form.status}
                                    onChange={e => setForm({ ...form, status: e.target.value })}
                                    className="flex h-12 w-full rounded-xl border border-white/10 bg-background/50 px-3 py-2 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="CLOSED">Closed</option>
                                </select>
                            </div>
                        </div>

                        <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                <Lock size={20} />
                            </div>
                            <div className="space-y-1 flex-1">
                                <Label className="text-sm font-bold">Password Management</Label>
                                <p className="text-xs text-muted-foreground mb-3">
                                    {initialData ? "Leave this blank if you don't want to change the password." : "Set a secure password for the new client."}
                                </p>
                                <Input
                                    required={!initialData}
                                    type="password"
                                    placeholder={initialData ? "••••••••••••" : "Enter secure password"}
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    className="h-12 rounded-xl bg-background/80 border-white/10 font-medium"
                                />
                                <PasswordStrength password={form.password} className="mt-4" />
                            </div>
                        </div>
                    </TabsContent>

                    {/* Business Tab */}
                    <TabsContent value="business" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Company Name</Label>
                                <div className="relative">
                                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                    <Input
                                        value={form.companyName}
                                        onChange={e => setForm({ ...form, companyName: e.target.value })}
                                        className="h-12 rounded-xl bg-background/50 border-white/10 pl-11 font-medium"
                                        placeholder="Enter company name..."
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Business Type</Label>
                                    <Input
                                        placeholder="e.g. Individual, PLC, LLC"
                                        value={form.businessType}
                                        onChange={e => setForm({ ...form, businessType: e.target.value })}
                                        className="h-12 rounded-xl bg-background/50 border-white/10 font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tax ID / VAT Number</Label>
                                    <Input
                                        value={form.taxId}
                                        onChange={e => setForm({ ...form, taxId: e.target.value })}
                                        className="h-12 rounded-xl bg-background/50 border-white/10 font-medium"
                                        placeholder="Registration number..."
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Default Currency</Label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                        <select
                                            value={form.currency}
                                            onChange={e => setForm({ ...form, currency: e.target.value })}
                                            className="flex h-12 w-full rounded-xl border border-white/10 bg-background/50 pl-11 pr-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                        >
                                            {currencies.map(curr => (
                                                <option key={curr.code} value={curr.code}>{curr.code} - {curr.prefix || curr.suffix}</option>
                                            ))}
                                            {currencies.length === 0 && <option value="BDT">BDT</option>}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Client Group</Label>
                                    <select
                                        value={form.groupId}
                                        onChange={e => setForm({ ...form, groupId: e.target.value })}
                                        className="flex h-12 w-full rounded-xl border border-white/10 bg-background/50 px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                    >
                                        <option value="">None (General)</option>
                                        {groups.map(group => (
                                            <option key={group.id} value={group.id}>{group.groupName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Address Tab */}
                    <TabsContent value="address" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Address Line 1</Label>
                            <Input
                                value={form.address1}
                                onChange={e => setForm({ ...form, address1: e.target.value })}
                                className="h-12 rounded-xl bg-background/50 border-white/10 font-medium"
                                placeholder="Street address..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Address Line 2 (Optional)</Label>
                            <Input
                                value={form.address2}
                                onChange={e => setForm({ ...form, address2: e.target.value })}
                                className="h-12 rounded-xl bg-background/50 border-white/10 font-medium"
                                placeholder="Apartment, suite, etc."
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">City</Label>
                                <Input
                                    value={form.city}
                                    onChange={e => setForm({ ...form, city: e.target.value })}
                                    className="h-12 rounded-xl bg-background/50 border-white/10 font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">State / Region</Label>
                                <Input
                                    value={form.state}
                                    onChange={e => setForm({ ...form, state: e.target.value })}
                                    className="h-12 rounded-xl bg-background/50 border-white/10 font-medium"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Postcode / ZIP</Label>
                                <Input
                                    value={form.postcode}
                                    onChange={e => setForm({ ...form, postcode: e.target.value })}
                                    className="h-12 rounded-xl bg-background/50 border-white/10 font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Country</Label>
                                <Input
                                    value={form.country}
                                    onChange={e => setForm({ ...form, country: e.target.value })}
                                    className="h-12 rounded-xl bg-background/50 border-white/10 font-medium"
                                />
                            </div>
                        </div>
                    </TabsContent>

                    {/* Admin Tab */}
                    <TabsContent value="other" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Internal Admin Notes</Label>
                            <Textarea
                                value={form.notes}
                                onChange={e => setForm({ ...form, notes: e.target.value })}
                                className="min-h-[250px] rounded-2xl bg-background/50 border-white/10 font-medium leading-relaxed"
                                placeholder="Add private notes about this client (only visible to staff)..."
                            />
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                    {onCancel && (
                        <Button type="button" variant="ghost" onClick={onCancel} className="h-12 px-6 rounded-xl hover:bg-secondary/50">
                            <X size={18} className="mr-2" /> Cancel
                        </Button>
                    )}
                    <Button
                        type="submit"
                        disabled={loading}
                        className="h-12 px-10 rounded-xl font-bold gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Account
                    </Button>
                </div>
            </form>
        </div>
    );
}
