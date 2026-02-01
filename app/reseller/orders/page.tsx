"use client";

import React, { useState, useEffect } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useLanguage } from "@/components/language-provider";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/ui/button";
import {
    ShoppingCart,
    Search,
    Filter,
    RefreshCw,
    Loader2,
    ChevronRight,
    Users,
    CreditCard,
    Calendar,
    ExternalLink
} from "lucide-react";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { toast } from "sonner";

export default function ResellerOrdersPage() {
    const { t } = useLanguage();
    const { formatPrice } = useSettingsStore();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchResellerOrders();
    }, []);

    const fetchResellerOrders = async () => {
        try {
            setLoading(true);
            const response = await api.get("/reseller/orders");
            setOrders(response.data.data.orders || []);
        } catch (err) {
            console.error("Error fetching orders:", err);
            toast.error("Failed to load order history.");
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            header: "Order / Client",
            accessorKey: "id" as any,
            cell: (item: any) => (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                        <ShoppingCart size={18} />
                    </div>
                    <div>
                        <p className="font-black text-foreground">#{item.id}</p>
                        <p className="text-[10px] text-muted-foreground font-bold flex items-center gap-1 uppercase tracking-tight">
                            <Users size={10} /> {item.client?.user?.firstName} {item.client?.user?.lastName}
                        </p>
                    </div>
                </div>
            )
        },
        {
            header: "Date",
            accessorKey: "createdAt" as any,
            cell: (item: any) => (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar size={14} />
                    <span className="font-bold text-xs">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
            )
        },
        {
            header: "Total Value",
            accessorKey: "totalAmount" as any,
            cell: (item: any) => (
                <div className="font-black text-sm">
                    {formatPrice(Number(item.totalAmount))}
                </div>
            )
        },
        {
            header: "Status",
            accessorKey: "status" as any,
            cell: (item: any) => (
                <Badge
                    className={cn(
                        "px-2 py-0.5 rounded-md font-black text-[10px] tracking-widest",
                        item.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' :
                            item.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                                'bg-rose-500/10 text-rose-500'
                    )}
                >
                    {item.status}
                </Badge>
            )
        },
        {
            header: "Actions",
            accessorKey: "id" as any,
            cell: (item: any) => (
                <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl font-black text-[10px] tracking-widest uppercase bg-white/5 border-white/10 hover:bg-secondary hover:text-white transition-all gap-2">
                    Details
                    <ChevronRight size={12} />
                </Button>
            )
        }
    ];

    return (
        <AuthGuard allowedRoles={["RESELLER"]}>
            <div className="min-h-screen bg-white text-foreground transition-colors duration-300">
                <Navbar />
                <Sidebar />
                <main className="lg:pl-75 pt-20 p-4 md:p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                                    Customer <span className="text-secondary">Orders</span>
                                </h1>
                                <p className="text-muted-foreground mt-1 text-sm md:text-base font-medium">Tracking order history and fulfillment for your client base.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="h-12 px-6 rounded-2xl bg-card border border-border flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                                    <span className="text-xs font-black uppercase tracking-widest">{orders.length} Processed Orders</span>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Filter by Order ID or Client..."
                                    className="pl-12 h-12 rounded-2xl bg-card/50 border-border/50 focus:border-secondary/50 transition-all font-bold text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <Button variant="outline" className="h-12 rounded-xl bg-secondary/30 border-border font-bold gap-2">
                                    <Filter size={18} /> Export
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-12 w-12 rounded-xl bg-secondary/30 border-border hover:bg-secondary/50"
                                    onClick={fetchResellerOrders}
                                >
                                    <RefreshCw className={cn("w-5 h-5 text-muted-foreground", loading && "animate-spin")} />
                                </Button>
                            </div>
                        </div>

                        {/* Main Grid */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card border border-border rounded-2xl overflow-hidden p-6 md:p-8 shadow-sm"
                        >
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader2 className="w-12 h-12 animate-spin text-secondary" />
                                    <p className="text-muted-foreground font-black uppercase text-xs tracking-widest animate-pulse">Retrieving Order Logs...</p>
                                </div>
                            ) : (
                                <DataTable
                                    columns={columns}
                                    data={orders.filter(o =>
                                        o.id.toString().includes(searchTerm) ||
                                        o.client?.user?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        o.client?.user?.lastName.toLowerCase().includes(searchTerm.toLowerCase())
                                    )}
                                />
                            )}
                        </motion.div>
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
