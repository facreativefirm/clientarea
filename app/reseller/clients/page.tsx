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
    Users,
    Search,
    Filter,
    RefreshCw,
    Loader2,
    Mail,
    Phone,
    Calendar,
    ChevronRight,
    CircleDot,
    ExternalLink,
    ShieldCheck,
    MessageSquare
} from "lucide-react";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ResellerClientsPage() {
    const { t } = useLanguage();
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchResellerClients();
    }, []);

    const fetchResellerClients = async () => {
        try {
            setLoading(true);
            const response = await api.get("/reseller/clients");
            setClients(response.data.data.clients || []);
        } catch (err) {
            console.error("Error fetching clients:", err);
            toast.error("Failed to load client database.");
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            header: "Identity",
            accessorKey: "user.firstName" as any,
            cell: (item: any) => (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <Users size={16} />
                    </div>
                    <div>
                        <p className="font-black text-foreground">{item.user.firstName} {item.user.lastName}</p>
                        <p className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                            <Mail size={10} /> {item.user.email}
                        </p>
                    </div>
                </div>
            )
        },
        {
            header: "Tier / Group",
            accessorKey: "group" as any,
            cell: (item: any) => (
                <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span className="font-bold text-sm tracking-tight">{item.group || 'Tier 1 Customer'}</span>
                </div>
            )
        },
        {
            header: "Loyalty Since",
            accessorKey: "user.createdAt" as any,
            cell: (item: any) => (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar size={14} />
                    <span className="font-bold text-xs">{new Date(item.user.createdAt).toLocaleDateString()}</span>
                </div>
            )
        },
        {
            header: "Status",
            accessorKey: "user.status" as any,
            cell: (item: any) => (
                <Badge variant={item.user.status === 'ACTIVE' ? 'success' : 'destructive'} className="px-2 py-0.5 rounded-md font-black text-[10px] tracking-widest">
                    {item.user.status}
                </Badge>
            )
        },
        {
            header: "Operations",
            accessorKey: "id" as any,
            cell: (item: any) => (
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl bg-white/5 border-white/10 hover:bg-primary/10 hover:text-primary transition-all">
                        <MessageSquare size={14} />
                    </Button>
                    <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl font-black text-[10px] tracking-widest uppercase bg-white/5 border-white/10 hover:bg-primary hover:text-white transition-all gap-2">
                        View Dossier
                        <ChevronRight size={12} />
                    </Button>
                </div>
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
                                    Client <span className="text-secondary">CRM</span>
                                </h1>
                                <p className="text-muted-foreground mt-1 text-sm md:text-base font-medium">Monitoring and managing your direct customer base under your white-label.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="h-12 px-6 rounded-2xl bg-card border border-border flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-xs font-black uppercase tracking-widest">{clients.length} Loyal Entities</span>
                                </div>
                            </div>
                        </div>

                        {/* CRM Controls */}
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or email..."
                                    className="pl-12 h-12 rounded-2xl bg-card/50 border-border/50 focus:border-primary/50 transition-all font-bold text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <Button variant="outline" className="h-12 rounded-xl bg-secondary/30 border-border font-bold gap-2">
                                    <Filter size={18} /> Segment
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-12 w-12 rounded-xl bg-secondary/30 border-border hover:bg-secondary/50"
                                    onClick={fetchResellerClients}
                                >
                                    <RefreshCw className={cn("w-5 h-5 text-muted-foreground", loading && "animate-spin")} />
                                </Button>
                            </div>
                        </div>

                        {/* CRM Main Grid */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card border border-border rounded-2xl overflow-hidden p-6 md:p-8 shadow-sm"
                        >
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                                    <p className="text-muted-foreground font-black uppercase text-xs tracking-widest animate-pulse">Accessing Encrypted Records...</p>
                                </div>
                            ) : (
                                <DataTable
                                    columns={columns}
                                    data={clients.filter(c =>
                                        c.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        c.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        c.user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
