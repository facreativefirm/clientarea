"use client";

import React, { useState, useEffect, use } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useLanguage } from "@/components/language-provider";
import {
    User,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    Package,
    Globe,
    Shield,
    Clock,
    DollarSign,
    Settings,
    ArrowUpRight,
    BellRing,
    Loader2,
    Activity,
    TrendingUp,
    LayoutDashboard
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/shared/Badge";
import { DataTable } from "@/components/shared/DataTable";
import { Skeleton } from "@/components/shared/Skeleton";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn, formatLabel } from "@/lib/utils";
import { useSettingsStore } from "@/lib/store/settingsStore";

export default function ClientProfilePage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = use(paramsPromise);
    const { id } = params;
    const { t } = useLanguage();
    const [client, setClient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { formatPrice } = useSettingsStore();

    useEffect(() => {
        fetchClientData();
    }, [id]);

    const fetchClientData = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const response = await api.get(`/clients/${id}`);
            setClient(response.data.data.client);
        } catch (error) {
            toast.error("Failed to load client data");
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleSendRenewalNotice = async () => {
        try {
            setIsRefreshing(true);
            const res = await api.post(`/clients/${id}/send-renewal-notice`);
            toast.success(res.data.message || "Manual renewal notice sent successfully");
            fetchClientData(true);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "No renewal candidates found.");
        } finally {
            setIsRefreshing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
            </div>
        );
    }

    if (!client) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-muted-foreground font-bold italic">Client profile record not found.</p>
        </div>
    );

    const primaryContact = client.contacts?.find((c: any) => c.isPrimary) || client.contacts?.[0];
    const totalPaid = client.invoices?.filter((i: any) => i.status === 'PAID').reduce((sum: number, i: any) => sum + (Number(i.totalAmount) || 0), 0) || 0;
    const unpaidBalance = client.invoices?.filter((i: any) => i.status === 'UNPAID' || i.status === 'OVERDUE').reduce((sum: number, i: any) => sum + (Number(i.totalAmount) || 0), 0) || 0;

    const stats = [
        { label: "Active Services", value: client.services?.filter((s: any) => s.status === 'ACTIVE').length || 0, icon: Package, color: "text-blue-500" },
        { label: "Unpaid Invoices", value: client.invoices?.filter((i: any) => i.status === 'UNPAID').length || 0, icon: Clock, color: "text-rose-500" },
        { label: "Credit Balance", value: formatPrice(client.creditBalance || 0), icon: DollarSign, color: "text-amber-500" },
        { label: "Total Paid", value: formatPrice(totalPaid), icon: TrendingUp, color: "text-emerald-500" },
    ];

    return (
        <AuthGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <div className="min-h-screen bg-white text-foreground transition-colors duration-300">
                <Navbar />
                <Sidebar />
                <main className="min-h-screen lg:pl-72 pt-20 p-4 md:p-8 space-y-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-black border border-primary/20">
                                {client.user?.firstName?.[0]}{client.user?.lastName?.[0]}
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold tracking-tight">{client.user?.firstName} {client.user?.lastName}</h1>
                                    <Badge variant={client.status === 'ACTIVE' ? 'success' : 'secondary'}>{formatLabel(client.status)}</Badge>
                                </div>
                                <p className="text-muted-foreground text-sm font-medium flex items-center gap-2 mt-1">
                                    <Mail size={14} className="opacity-60" /> {client.user?.email} • ID: {client.id}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <Link href={`/admin/clients/${id}/edit`}>
                                <Button className="gap-2 flex-1 md:flex-none h-11 rounded-xl font-bold shadow-lg shadow-primary/20">
                                    <Settings size={16} />
                                    Edit Profile
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-card border border-border/50 p-6 rounded-[2rem] space-y-3 shadow-sm hover:border-primary/50 transition-colors"
                            >
                                <div className={cn("p-2 rounded-xl bg-opacity-10 w-fit", stat.color.replace('text-', 'bg-'))}>
                                    <stat.icon size={20} className={stat.color} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">{stat.label}</p>
                                    <p className="text-2xl font-black">{stat.value}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Content Tabs */}
                    <Tabs defaultValue="overview" className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <TabsList className="bg-secondary/20 p-1 rounded-xl border border-white/5 h-auto">
                                {[
                                    { value: "overview", label: "Overview", icon: LayoutDashboard },
                                    { value: "services", label: "Services", icon: Package },
                                    { value: "billing", label: "Billing", icon: CreditCard },
                                    { value: "security", label: "Security", icon: Shield },
                                ].map(tab => (
                                    <TabsTrigger
                                        key={tab.value}
                                        value={tab.value}
                                        className="rounded-lg px-6 py-2.5 font-bold transition-all gap-2"
                                    >
                                        <tab.icon size={16} />
                                        {tab.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            <Button
                                variant="outline"
                                className="gap-2 rounded-xl font-bold border-primary/20 text-primary hover:bg-primary/5"
                                onClick={handleSendRenewalNotice}
                                disabled={isRefreshing}
                            >
                                {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellRing size={16} />}
                                Send Renewal Notice
                            </Button>
                        </div>

                        {/* Overview Tab Content */}
                        <TabsContent value="overview" className="space-y-8 mt-0 outline-none">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="glass rounded-[2rem] p-8 space-y-8">
                                    <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                                        <User className="text-primary" size={20} />
                                        <h3 className="font-bold text-lg">Contact Information</h3>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500"><Mail size={20} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Email Address</p>
                                                <p className="font-bold">{client.user?.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500"><Phone size={20} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Phone Number</p>
                                                <p className="font-bold">{client.user?.phoneNumber || primaryContact?.phone || "Not provided"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .011 5.403.007 12.039a11.81 11.81 0 001.592 5.961L0 24l6.117-1.605a11.782 11.782 0 005.925 1.598h.005c6.637 0 12.04-5.402 12.044-12.04a11.817 11.817 0 00-3.41-8.508z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">WhatsApp Number</p>
                                                <p className="font-bold">{client.user?.whatsAppNumber || "Not provided"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500"><MapPin size={20} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Full Address</p>
                                                <p className="font-bold leading-tight">
                                                    {primaryContact?.address1}<br />
                                                    {primaryContact?.city}, {primaryContact?.state} {primaryContact?.zip}<br />
                                                    {primaryContact?.country}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass rounded-[2rem] p-8 space-y-8">
                                    <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                                        <Globe className="text-primary" size={20} />
                                        <h3 className="font-bold text-lg">Administrative Details</h3>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-1">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Company / Business</p>
                                            <p className="font-bold">{client.companyName || "Personal Profile"}</p>
                                            <p className="text-xs text-muted-foreground uppercase font-medium">{client.businessType || "Retail Client"}</p>
                                        </div>
                                        <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-1">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tax Information</p>
                                            <p className="font-bold font-mono text-sm">{client.taxId || "Not Registered"}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Internal Admin Notes</p>
                                            <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-sm italic text-muted-foreground leading-relaxed">
                                                {client.notes || "No internal notes recorded for this client."}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Services List */}
                        <TabsContent value="services" className="mt-0 outline-none">
                            <div className="glass rounded-[2rem] p-6">
                                <DataTable
                                    columns={[
                                        {
                                            header: "Product/Service",
                                            accessorKey: "id" as any,
                                            cell: (item: any) => (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                                        <Package size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">{item.product?.name}</p>
                                                        <p className="text-[10px] font-mono text-muted-foreground">{item.domain || "No Domain"}</p>
                                                    </div>
                                                </div>
                                            )
                                        },
                                        { header: "Pricing", accessorKey: "amount" as any, cell: (item: any) => <span className="font-bold">{formatPrice(item.amount)}</span> },
                                        {
                                            header: "Due Date",
                                            accessorKey: "nextDueDate" as any,
                                            cell: (item: any) => (
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-xs">{item.nextDueDate ? new Date(item.nextDueDate).toLocaleDateString() : "N/A"}</span>
                                                    <span className="text-[8px] font-black uppercase text-muted-foreground mt-0.5">{formatLabel(item.billingCycle)}</span>
                                                </div>
                                            )
                                        },
                                        {
                                            header: "Status",
                                            accessorKey: "status" as any,
                                            cell: (item: any) => (
                                                <Badge variant={item.status === 'ACTIVE' ? 'success' : item.status === 'PENDING' ? 'warning' : 'secondary'} className="px-3 py-1 text-[9px] uppercase font-bold">
                                                    {formatLabel(item.status)}
                                                </Badge>
                                            )
                                        },
                                        {
                                            header: "Actions",
                                            accessorKey: "id" as any,
                                            cell: (item: any) => (
                                                <Link href={`/admin/services/${item.id}`}>
                                                    <Button variant="ghost" size="sm" className="font-bold hover:bg-primary/10 hover:text-primary transition-all">Manage</Button>
                                                </Link>
                                            )
                                        }
                                    ]}
                                    data={client.services || []}
                                />
                            </div>
                        </TabsContent>

                        {/* Billing / Invoices */}
                        <TabsContent value="billing" className="mt-0 outline-none">
                            <div className="glass rounded-[2rem] p-6">
                                <DataTable
                                    columns={[
                                        { header: "Invoice #", accessorKey: "invoiceNumber" as any, cell: (item: any) => <span className="font-bold">#{item.invoiceNumber}</span> },
                                        {
                                            header: "Issued Date",
                                            accessorKey: "createdAt" as any,
                                            cell: (item: any) => <span className="text-xs font-bold">{new Date(item.createdAt).toLocaleDateString()}</span>
                                        },
                                        { header: "Amount Due", accessorKey: "totalAmount" as any, cell: (item: any) => <span className="font-bold text-foreground">{formatPrice(item.totalAmount)}</span> },
                                        {
                                            header: "Status",
                                            accessorKey: "status" as any,
                                            cell: (item: any) => (
                                                <Badge variant={item.status === 'PAID' ? 'success' : item.status === 'UNPAID' ? 'destructive' : 'secondary'} className="px-3 py-1 text-[9px] uppercase font-bold">
                                                    {formatLabel(item.status)}
                                                </Badge>
                                            )
                                        },
                                        {
                                            header: "Actions",
                                            accessorKey: "id" as any,
                                            cell: (item: any) => (
                                                <div className="flex gap-2">
                                                    <Link href={`/admin/billing/${item.id}`}>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-primary">
                                                            <ArrowUpRight size={16} />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            )
                                        }
                                    ]}
                                    data={client.invoices || []}
                                />
                            </div>
                        </TabsContent>

                        {/* Security Log Placeholder */}
                        <TabsContent value="security" className="mt-0 outline-none">
                            <div className="glass rounded-[2rem] p-12 text-center">
                                <Shield className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                                <h3 className="font-bold text-lg mb-2">Security & Access Log</h3>
                                <p className="text-muted-foreground text-sm max-w-sm mx-auto">This module is currently indexing client access patterns. Historical login data will appear here shortly.</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
        </AuthGuard>
    );
}
