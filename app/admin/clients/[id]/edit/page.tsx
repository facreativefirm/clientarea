"use client";

import React, { useState, useEffect, use } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { ClientForm } from "@/components/admin/clients/ClientForm";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function EditClientPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = use(paramsPromise);
    const { id } = params;
    const { t } = useLanguage();
    const router = useRouter();
    const [client, setClient] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClientData();
    }, [id]);

    const fetchClientData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/clients/${id}`);
            setClient(response.data.data.client);
        } catch (error) {
            toast.error("Failed to load client data");
            router.push("/admin/clients");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <AuthGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
                <Navbar />
                <Sidebar />
                <main className="pl-0 md:pl-75 pt-20 p-8 flex justify-center">
                    <div className="w-full max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Header */}
                        <div className="flex items-center justify-between bg-card/50 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 shadow-xl">
                            <div className="flex items-center gap-4">
                                <Link href={`/admin/clients/${id}`}>
                                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary/50">
                                        <ArrowLeft size={20} />
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight">
                                        Edit Profile
                                    </h1>
                                    <p className="text-muted-foreground flex items-center gap-2">
                                        <span className="font-medium text-foreground">{client?.user?.firstName} {client?.user?.lastName}</span>
                                        <span className="opacity-20">|</span>
                                        <span>ID: {client?.id}</span>
                                        <span className="opacity-20">|</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{client?.status}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="glass rounded-[2.5rem] p-1 border border-white/5 shadow-2xl relative overflow-hidden overflow-y-auto">
                            <ClientForm
                                initialData={client}
                                onSuccess={() => router.push(`/admin/clients/${id}`)}
                                onCancel={() => router.push(`/admin/clients/${id}`)}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
