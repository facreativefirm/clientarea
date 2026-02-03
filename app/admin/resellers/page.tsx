"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useLanguage } from "@/components/language-provider";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter, MoreHorizontal, Users, DollarSign, Globe, Loader2, UserPlus, ShieldCheck, Banknote } from "lucide-react";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import Link from "next/link";
import { Skeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { toast } from "sonner";
import { useSettingsStore } from "@/lib/store/settingsStore";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";

export default function AdminResellersPage() {
    const { t } = useLanguage();
    const { formatPrice } = useSettingsStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [resellers, setResellers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newResellerEmail, setNewResellerEmail] = useState("");
    const [isPromoting, setIsPromoting] = useState(false);

    const [globalStats, setGlobalStats] = useState<any>(null);

    useEffect(() => {
        fetchResellers();
        fetchGlobalStats();
    }, []);

    const fetchResellers = async () => {
        try {
            setLoading(true);
            const response = await api.get("/users?type=RESELLER");
            setResellers(response.data.data.users || []);
            setError(null);
        } catch (err: any) {
            console.error("Error fetching resellers:", err);
            setError(err.response?.data?.message || "Failed to load resellers");
        } finally {
            setLoading(false);
        }
    };

    const fetchGlobalStats = async () => {
        try {
            const res = await api.get("/reseller/admin-stats");
            setGlobalStats(res.data.data);
        } catch (err) {
            console.error("Failed to load global reseller stats");
        }
    };

    const handleAddReseller = async () => {
        if (!newResellerEmail) return;

        try {
            setIsPromoting(true);
            // 1. Find user by email
            const searchRes = await api.get(`/users?email=${newResellerEmail}`);
            const users = searchRes.data.data.users;

            if (users.length === 0) {
                toast.error("No user found with this email. Please ensure the user is registered first.");
                return;
            }

            const user = users[0];

            // 2. Update user to RESELLER
            await api.patch(`/users/${user.id}`, {
                userType: 'RESELLER',
                resellerType: 'BASIC',
                commissionRate: 15.00
            });

            toast.success(`${user.firstName} has been promoted to Reseller!`);
            setIsAddDialogOpen(false);
            setNewResellerEmail("");
            fetchResellers();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to promote user to reseller");
        } finally {
            setIsPromoting(false);
        }
    };

    const filteredResellers = resellers.filter(reseller =>
        searchTerm === "" ||
        reseller.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reseller.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reseller.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            header: "Reseller",
            accessorKey: "firstName" as any,
            cell: (item: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                        {item.firstName?.[0]}{item.lastName?.[0]}
                    </div>
                    <div>
                        <p className="font-bold">{item.firstName} {item.lastName}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item.email}</p>
                    </div>
                </div>
            )
        },
        {
            header: "Type",
            accessorKey: "resellerType" as any,
            cell: (item: any) => (
                <Badge variant="outline" className="font-black border-primary/20 text-primary">
                    {item.resellerType || 'BASIC'}
                </Badge>
            )
        },
        {
            header: "Commission",
            accessorKey: "commissionRate" as any,
            cell: (item: any) => (
                <span className="font-bold text-emerald-500">{item.commissionRate || 15}%</span>
            )
        },
        {
            header: "White-Label",
            accessorKey: "whiteLabelEnabled" as any,
            cell: (item: any) => (
                <Badge variant={item.whiteLabelEnabled ? 'success' : 'secondary'}>
                    {item.whiteLabelEnabled ? 'Active' : 'Disabled'}
                </Badge>
            )
        },
        {
            header: "Status",
            accessorKey: "status" as any,
            cell: (item: any) => (
                <Badge variant={item.status === 'ACTIVE' ? 'success' : 'secondary'}>
                    {item.status}
                </Badge>
            )
        },
        {
            header: "Actions",
            accessorKey: "id" as any,
            cell: (item: any) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="font-bold">Edit</Button>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-white text-foreground transition-colors duration-300">
            <Navbar />
            <Sidebar />
            <main className="min-h-screen lg:pl-72 pt-20 p-4 md:p-8 space-y-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                            Infrastructure <span className="text-primary">Resellers</span>
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm md:text-base font-medium">Manage your channel partners and white-label ecosystem.</p>
                    </div>

                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <div className="flex gap-4 w-full md:w-auto">
                            <Button variant="outline" asChild className="h-12 px-6 rounded-xl font-bold border-border hover:bg-secondary/50 shadow-sm gap-2 w-full md:w-auto">
                                <Link href="/admin/resellers/payouts">
                                    <Banknote className="w-4 h-4" />
                                    Payout Requests
                                </Link>
                            </Button>
                            <DialogTrigger asChild>
                                <Button className="h-12 px-6 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md gap-2 w-full md:w-auto">
                                    <Plus className="w-4 h-4" />
                                    Add Reseller
                                </Button>
                            </DialogTrigger>
                        </div>
                        <DialogContent className="sm:max-w-[425px] bg-card border-border">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black">Promote to Reseller</DialogTitle>
                                <DialogDescription className="font-medium">
                                    Enter the registered email of the user you wish to promote to a reseller partner.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">User Email Address</label>
                                    <Input
                                        placeholder="user@example.com"
                                        className="h-12 rounded-xl bg-secondary/20 border-border font-medium"
                                        value={newResellerEmail}
                                        onChange={(e) => setNewResellerEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    className="h-12 w-full rounded-xl font-bold gap-2"
                                    onClick={handleAddReseller}
                                    disabled={isPromoting || !newResellerEmail}
                                >
                                    {isPromoting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                    Activate Reseller Status
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Total Resellers</p>
                            <h3 className="text-2xl font-bold">{globalStats?.totalResellers || 0}</h3>
                        </div>
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Channel Revenue</p>
                            <h3 className="text-2xl font-bold">{formatPrice(Number(globalStats?.channelRevenue || 0))}</h3>
                        </div>
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                            <Globe size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Active White-Labels</p>
                            <h3 className="text-2xl font-bold">{globalStats?.activeWhiteLabels || 0}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search resellers by name or email..."
                                className="pl-12 h-12 bg-secondary/20 border-border rounded-xl font-medium focus:ring-primary/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 text-destructive font-bold">{error}</div>
                    ) : filteredResellers.length === 0 ? (
                        <EmptyState
                            icon={Users}
                            title="No Resellers Setup"
                            description="You haven't onboarded any reseller partners yet."
                            actionLabel="Add Reseller"
                            onAction={() => setIsAddDialogOpen(true)}
                        />
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <DataTable columns={columns} data={filteredResellers} />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
