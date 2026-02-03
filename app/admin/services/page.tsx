"use client";

import React, { useState, useEffect, Suspense } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useLanguage } from "@/components/language-provider";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import {
    Server,
    Search,
    RefreshCw,
    Loader2,
    Globe,
    Database,
    ShieldCheck,
    ArrowUpRight,
    User,
    Settings,
    Plus,
    Filter
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { cn, formatLabel } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/shared/Skeleton";

function AdminServicesContent() {
    const { t } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();
    const typeParam = searchParams.get('type');

    const [services, setServices] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(typeParam || "all");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (typeParam) setFilter(typeParam);
    }, [typeParam]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [servicesRes, categoriesRes] = await Promise.all([
                api.get("/services"),
                api.get("/products/services")
            ]);
            setServices(servicesRes.data.data.services || []);
            setCategories(categoriesRes.data.data.services || []);
        } catch (err) {
            console.error("Error fetching data:", err);
            toast.error("Failed to load services list");
        } finally {
            setLoading(false);
        }
    };

    // Flatten logic for categories to handle nested filtering if needed
    const allowedSlugs = React.useMemo(() => {
        if (filter === 'all') return [];

        const findNode = (nodes: any[]): any | null => {
            for (const node of nodes) {
                if (node.slug.toLowerCase() === filter.toLowerCase()) return node;
                if (node.subServices?.length) {
                    const result = findNode(node.subServices);
                    if (result) return result;
                }
            }
            return null;
        };

        const collectSlugs = (node: any, slugs: string[]) => {
            slugs.push(node.slug.toLowerCase());
            node.subServices?.forEach((child: any) => collectSlugs(child, slugs));
        };

        const targetNode = findNode(categories);
        if (!targetNode) return [filter.toLowerCase()];

        const slugs: string[] = [];
        collectSlugs(targetNode, slugs);
        return slugs;
    }, [filter, categories]);

    const filteredServices = services.filter(s => {
        const domainMatch = (s.domain || "").toLowerCase().includes(searchTerm.toLowerCase());
        const clientMatch = `${s.client?.user?.firstName} ${s.client?.user?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
        const productMatch = (s.product?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSearch = domainMatch || clientMatch || productMatch;

        const matchesType = filter === 'all' ||
            allowedSlugs.includes(s.product?.productService?.slug?.toLowerCase()) ||
            s.product?.productType === filter;

        return matchesSearch && matchesType;
    });

    const columns = [
        {
            header: t("product_service") || "Product / Service",
            accessorKey: "product",
            cell: (item: any) => (
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center border transition-colors",
                        item.product?.productType === 'HOSTING' ? "bg-blue-500/10 border-blue-500/20 text-blue-500" :
                            item.product?.productType === 'RESELLER' ? "bg-purple-500/10 border-purple-500/20 text-purple-500" :
                                item.product?.productType === 'VPS' ? "bg-orange-500/10 border-orange-500/20 text-orange-500" :
                                    "bg-primary/10 border-primary/20 text-primary"
                    )}>
                        {item.product?.productType === 'HOSTING' ? <Globe size={18} /> :
                            item.product?.productType === 'RESELLER' ? <Database size={18} /> :
                                item.product?.productType === 'VPS' ? <Server size={18} /> :
                                    <ShieldCheck size={18} />}
                    </div>
                    <div>
                        <p className="font-bold text-sm">{item.product?.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{item.domain || "No Domain"}</p>
                    </div>
                </div>
            )
        },
        {
            header: t("client") || "Client",
            accessorKey: "client",
            cell: (item: any) => (
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
                        <User size={12} className="text-muted-foreground" />
                    </div>
                    <span className="font-bold text-sm tracking-tight text-foreground/80">
                        {item.client?.user?.firstName} {item.client?.user?.lastName}
                    </span>
                </div>
            )
        },
        {
            header: t("next_due_date") || "Next Due Date",
            accessorKey: "nextDueDate",
            cell: (item: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-sm">
                        {item.nextDueDate ? new Date(item.nextDueDate).toLocaleDateString() : t("none")}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase">{formatLabel(item.billingCycle) || "No Cycle"}</span>
                </div>
            )
        },
        {
            header: t("status") || "Status",
            accessorKey: "status",
            cell: (item: any) => (
                <Badge
                    variant={item.status === 'ACTIVE' ? 'success' : item.status === 'PENDING' ? 'warning' : 'destructive'}
                    className="px-3 py-1 rounded-lg font-bold text-[10px]"
                >
                    {formatLabel(item.status) || "Unknown"}
                </Badge>
            )
        },
        {
            header: t("actions") || "Actions",
            accessorKey: "id",
            cell: (item: any) => (
                <div className="flex gap-2">
                    <Link href={`/admin/services/${item.id}`}>
                        <Button variant="ghost" size="sm" className="font-bold">Manage</Button>
                    </Link>
                    <Link href={`/admin/clients/${item.clientId}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowUpRight size={14} />
                        </Button>
                    </Link>
                </div>
            )
        }
    ];

    return (
        <AuthGuard allowedRoles={["ADMIN", "SUPER_ADMIN", "STAFF"]}>
            <div className="min-h-screen bg-white text-foreground transition-colors duration-300">
                <Navbar />
                <Sidebar />
                <main className="min-h-screen lg:pl-72 pt-20 p-4 md:p-8 space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Client Services</h1>
                            <p className="text-muted-foreground">Manage and monitor all active client services and instances.</p>
                        </div>
                        <Link href="/admin/services/add">
                            <Button className="gap-2 shadow-lg shadow-primary/20">
                                <Plus size={18} />
                                Add New Service
                            </Button>
                        </Link>
                    </div>

                    {/* Integrated Controls & Table */}
                    <div className="glass rounded-[2rem] p-6 space-y-6">
                        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                            <Tabs value={filter} onValueChange={setFilter} className="w-full lg:w-auto">
                                <TabsList className="bg-secondary/50 p-1 rounded-xl h-12">
                                    <TabsTrigger value="all" className="rounded-lg px-4 font-bold text-xs">All</TabsTrigger>
                                    {categories.map((cat) => (
                                        <TabsTrigger key={cat.id} value={cat.slug} className="rounded-lg px-4 font-bold text-xs">
                                            {cat.name}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </Tabs>

                            <div className="flex items-center gap-3 w-full lg:w-auto">
                                <div className="relative flex-1 lg:w-72">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search domain or client..."
                                        className="pl-10 h-11 rounded-xl bg-secondary/30 border-none focus:ring-1 focus:ring-primary font-medium"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-11 w-11 rounded-xl hover:bg-secondary"
                                    onClick={fetchData}
                                >
                                    <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                                </Button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex gap-4 p-4 items-center bg-white/5 rounded-2xl border border-white/5">
                                        <Skeleton className="w-12 h-12 rounded-xl" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-1/4" />
                                            <Skeleton className="h-3 w-1/6" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredServices.length === 0 ? (
                            <EmptyState
                                icon={Server}
                                title="No Services Found"
                                description="There are no active services matching your current filter."
                                actionLabel="Add New Service"
                                onAction={() => router.push("/admin/services/add")}
                            />
                        ) : (
                            <DataTable columns={columns} data={filteredServices} />
                        )}
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}

export default function AdminServicesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        }>
            <AdminServicesContent />
        </Suspense>
    );
}
