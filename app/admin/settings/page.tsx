"use client";

import React, { useState, useEffect } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useLanguage } from "@/components/language-provider";
import {
    Settings,
    Globe,
    Lock,
    CreditCard,
    Bell,
    Database,
    Mail,
    ShieldCheck,
    Save,
    RefreshCw,
    Languages,
    Clock,
    DollarSign,
    Loader2,
    Settings2,
    Banknote,
    Zap
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function SystemSettingsPage() {
    const { t } = useLanguage();
    const [settings, setSettings] = useState({
        appName: "WHMCS CRM",
        supportEmail: "support@whmcscrm.com",
        maintenanceMode: "false",
        defaultLanguage: "english",
        defaultCurrency: "USD",
        force2FA: "false",
        allowedApiIps: "",
        smtpHost: "",
        smtpPort: "587",
        smtpUser: "",
        smtpPass: "",
        smtpFromEmail: "",
        smtpFromName: "WHMCS CRM",
        smtpSecure: "false",
        phoneNumber: "",
        taxRate: "5",
        taxName: "Tax"
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [runningCron, setRunningCron] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await api.get("/settings");
            if (response.data.status === 'success') {
                setSettings(prev => ({
                    ...prev,
                    ...response.data.data.settings
                }));
            }
        } catch (error) {
            toast.error("Failed to load system settings");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSetting = (key: string, value: any) => {
        setSettings((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put("/settings", settings);
            toast.success("Settings updated successfully");
        } catch (error) {
            console.error("Save settings error:", error);
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const handleRunCron = async () => {
        if (!confirm("Start manual maintenance run? This will process all expiring services and send notifications.")) return;
        setRunningCron(true);
        try {
            const res = await api.post("/system/run-cron");
            toast.success(res.data.message);
        } catch (error) {
            toast.error("Failed to run automated tasks");
        } finally {
            setRunningCron(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground animate-pulse">Loading...</p>
        </div>
    );

    return (
        <AuthGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
                <Navbar />
                <Sidebar />
                <main className="lg:pl-72 pt-20 p-4 md:p-8">
                    <div className="max-w-6xl mx-auto space-y-8">
                        {/* Header */}
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                                    System Configuration
                                </h1>
                                <p className="text-muted-foreground mt-1 text-lg">Manage global application behavior and preferences.</p>
                            </div>
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="h-12 px-8 rounded-2xl font-bold shadow-lg shadow-primary/20 gap-2"
                            >
                                {saving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                                Save Changes
                            </Button>
                        </div>

                        <Tabs defaultValue="general" className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            <TabsList className="flex flex-col h-auto bg-card/30 backdrop-blur-md p-2 rounded-3xl border border-border/50 lg:col-span-1 border-none self-start">
                                <TabsTrigger value="general" className="w-full justify-start rounded-2xl px-6 py-4 font-bold transition-all data-[state=active]:bg-primary/20 data-[state=active]:text-primary mb-2">
                                    <Globe size={18} className="mr-3" /> General
                                </TabsTrigger>
                                <TabsTrigger value="localization" className="w-full justify-start rounded-2xl px-6 py-4 font-bold transition-all data-[state=active]:bg-primary/20 data-[state=active]:text-primary mb-2">
                                    <Languages size={18} className="mr-3" /> Localization
                                </TabsTrigger>
                                <TabsTrigger value="mail" className="w-full justify-start rounded-2xl px-6 py-4 font-bold transition-all data-[state=active]:bg-primary/20 data-[state=active]:text-primary mb-2">
                                    <Mail size={18} className="mr-3" /> Mail Settings
                                </TabsTrigger>
                                <TabsTrigger value="billing" className="w-full justify-start rounded-2xl px-6 py-4 font-bold transition-all data-[state=active]:bg-primary/20 data-[state=active]:text-primary mb-2">
                                    <CreditCard size={18} className="mr-3" /> Billing Tax
                                </TabsTrigger>
                                <TabsTrigger value="security" className="w-full justify-start rounded-2xl px-6 py-4 font-bold transition-all data-[state=active]:bg-primary/20 data-[state=active]:text-primary mb-2">
                                    <ShieldCheck size={18} className="mr-3" /> Security
                                </TabsTrigger>
                            </TabsList>

                            <div className="lg:col-span-3 space-y-6">
                                <TabsContent value="mail" className="m-0 focus-visible:outline-none animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="bg-card/40 border border-border rounded-[2.5rem] p-10 space-y-8">
                                        <h3 className="text-xl font-black flex items-center gap-2">
                                            <Mail className="text-primary" size={24} />
                                            SMTP Configuration
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">SMTP Host</Label>
                                                <Input
                                                    value={settings.smtpHost || ""}
                                                    onChange={(e) => handleUpdateSetting("smtpHost", e.target.value)}
                                                    placeholder="smtp.example.com"
                                                    className="h-14 rounded-2xl bg-white/5 border-border focus:border-primary/50 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">SMTP Port</Label>
                                                <Input
                                                    value={settings.smtpPort || ""}
                                                    onChange={(e) => handleUpdateSetting("smtpPort", e.target.value)}
                                                    placeholder="587"
                                                    className="h-14 rounded-2xl bg-white/5 border-border focus:border-primary/50 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">SMTP Username</Label>
                                                <Input
                                                    value={settings.smtpUser || ""}
                                                    onChange={(e) => handleUpdateSetting("smtpUser", e.target.value)}
                                                    className="h-14 rounded-2xl bg-white/5 border-border focus:border-primary/50 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">SMTP Password</Label>
                                                <Input
                                                    type="password"
                                                    value={settings.smtpPass || ""}
                                                    onChange={(e) => handleUpdateSetting("smtpPass", e.target.value)}
                                                    className="h-14 rounded-2xl bg-white/5 border-border focus:border-primary/50 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">From Email Address</Label>
                                                <Input
                                                    value={settings.smtpFromEmail || ""}
                                                    onChange={(e) => handleUpdateSetting("smtpFromEmail", e.target.value)}
                                                    placeholder="noreply@example.com"
                                                    className="h-14 rounded-2xl bg-white/5 border-border focus:border-primary/50 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">From Name</Label>
                                                <Input
                                                    value={settings.smtpFromName || ""}
                                                    onChange={(e) => handleUpdateSetting("smtpFromName", e.target.value)}
                                                    className="h-14 rounded-2xl bg-white/5 border-border focus:border-primary/50 font-bold"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="space-y-1">
                                                <p className="font-bold">Use SSL/TLS (Secure Connection)</p>
                                                <p className="text-xs text-muted-foreground">Enable if your SMTP server requires a secure connection (usually port 465).</p>
                                            </div>
                                            <Switch
                                                checked={settings.smtpSecure === "true"}
                                                onCheckedChange={(val) => handleUpdateSetting("smtpSecure", val ? "true" : "false")}
                                            />
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="general" className="m-0 focus-visible:outline-none animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="bg-card/40 border border-border rounded-[2.5rem] p-10 space-y-8">
                                        <h3 className="text-xl font-black flex items-center gap-2">
                                            <Settings2 className="text-primary" size={24} />
                                            Core Configuration
                                        </h3>
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Company Name</Label>
                                                <Input
                                                    value={settings.appName || ""}
                                                    onChange={(e) => handleUpdateSetting("appName", e.target.value)}
                                                    className="h-14 rounded-2xl bg-white/5 border-border focus:border-primary/50 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Admin Email</Label>
                                                <Input
                                                    value={settings.supportEmail || ""}
                                                    onChange={(e) => handleUpdateSetting("supportEmail", e.target.value)}
                                                    className="h-14 rounded-2xl bg-white/5 border-border focus:border-primary/50 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Company Phone Number</Label>
                                                <Input
                                                    value={settings.phoneNumber || ""}
                                                    onChange={(e) => handleUpdateSetting("phoneNumber", e.target.value)}
                                                    placeholder="+8801..."
                                                    className="h-14 rounded-2xl bg-white/5 border-border focus:border-primary/50 font-bold"
                                                />
                                                <p className="text-[10px] text-muted-foreground">Used for WhatsApp integration and contact info.</p>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Maintenance Mode</Label>
                                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                                    <span className="text-sm font-bold text-muted-foreground">Enable Maintenance Mode</span>
                                                    <Switch
                                                        checked={settings.maintenanceMode === "true"}
                                                        onCheckedChange={(val) => handleUpdateSetting("maintenanceMode", val ? "true" : "false")}
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-border/10">
                                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Manual Diagnostics</h4>
                                                <Button
                                                    variant="outline"
                                                    disabled={runningCron}
                                                    onClick={handleRunCron}
                                                    className="w-full h-14 rounded-2xl border-primary/20 hover:bg-primary/5 text-primary font-bold gap-2"
                                                >
                                                    {runningCron ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                                                    Force Run Automation (Billing & Expiry)
                                                </Button>
                                                <p className="text-[10px] text-muted-foreground mt-2 px-1 italic">
                                                    Manually triggers the consolidation engine, scans for expiring services, and notifies clients.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="localization" className="m-0 focus-visible:outline-none animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="bg-card/40 border border-border rounded-[2.5rem] p-10 space-y-8">
                                        <h3 className="text-xl font-black flex items-center gap-2">
                                            <Globe className="text-primary" size={24} />
                                            Localization & SEO
                                        </h3>
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Default Language</Label>
                                                <Select
                                                    value={settings.defaultLanguage || "english"}
                                                    onValueChange={(val: string) => handleUpdateSetting("defaultLanguage", val)}
                                                >
                                                    <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-border font-bold">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-card border-border rounded-xl">
                                                        <SelectItem value="english">English</SelectItem>
                                                        <SelectItem value="bangla">Bangla</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Default Currency</Label>
                                                <Select
                                                    value={settings.defaultCurrency || "USD"}
                                                    onValueChange={(val: string) => handleUpdateSetting("defaultCurrency", val)}
                                                >
                                                    <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-border font-bold">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-card border-border rounded-xl">
                                                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                                                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                                                        <SelectItem value="BDT">BDT - Taka (৳)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="billing" className="m-0 focus-visible:outline-none animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="bg-card/40 border border-border rounded-[2.5rem] p-10 space-y-8">
                                        <h3 className="text-xl font-black flex items-center gap-2">
                                            <CreditCard className="text-primary" size={24} />
                                            Billing & Tax Configuration
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tax Identification Name</Label>
                                                <Input
                                                    value={settings.taxName || "Tax"}
                                                    onChange={(e) => handleUpdateSetting("taxName", e.target.value)}
                                                    placeholder="VAT, GST, Sales Tax..."
                                                    className="h-14 rounded-2xl bg-white/5 border-border focus:border-primary/50 font-bold"
                                                />
                                                <p className="text-[10px] text-muted-foreground px-1">Label shown on invoices (e.g. VAT, GST).</p>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Default Tax Rate (%)</Label>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        value={settings.taxRate || "0"}
                                                        onChange={(e) => handleUpdateSetting("taxRate", e.target.value)}
                                                        className="h-14 rounded-2xl bg-white/5 border-border focus:border-primary/50 font-bold pr-12"
                                                    />
                                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">%</div>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground px-1">Applied to all non-exempt items.</p>
                                            </div>
                                        </div>

                                        <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
                                            <p className="font-bold flex items-center gap-2 text-primary">
                                                <Banknote className="w-4 h-4" />
                                                Note on Progressive Billing
                                            </p>
                                            <p className="text-sm text-primary/70">
                                                The system automatically uses this rate for all new and consolidated renewal invoices.
                                                Tax exempt clients (set in client groups) will continue to pay 0% regardless of this setting.
                                            </p>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="security" className="m-0 focus-visible:outline-none animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="bg-card/40 border border-border rounded-[2.5rem] p-10 space-y-8">
                                        <h3 className="text-xl font-black flex items-center gap-2">
                                            <ShieldCheck className="text-primary" size={24} />
                                            Security Configuration
                                        </h3>
                                        <div className="space-y-6">
                                            <div className="flex items-start gap-4 p-6 rounded-2xl bg-rose-500/5 border border-rose-500/20">
                                                <Lock className="text-rose-500 shrink-0 mt-1" size={24} />
                                                <div className="space-y-1">
                                                    <p className="font-bold">Two-Factor Authentication</p>
                                                    <p className="text-sm text-muted-foreground">Force all administrative accounts to use 2FA</p>
                                                </div>
                                                <Switch
                                                    checked={settings.force2FA === "true"}
                                                    onCheckedChange={(val: boolean) => handleUpdateSetting("force2FA", val ? "true" : "false")}
                                                    className="ml-auto"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <Label className="text-sm font-bold ml-1">Allowed IP Addresses for API</Label>
                                                <textarea
                                                    value={settings.allowedApiIps || ""}
                                                    onChange={(e) => handleUpdateSetting("allowedApiIps", e.target.value)}
                                                    className="w-full h-32 rounded-2xl bg-white/5 border border-border/50 p-4 font-mono text-sm focus:outline-none focus:border-primary/50 transition-all"
                                                    placeholder="192.168.1.1&#10;10.0.0.1"
                                                />
                                                <p className="text-xs text-muted-foreground italic">One IP address per line. Leave empty for all.</p>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </main>
            </div >
        </AuthGuard >
    );
}

