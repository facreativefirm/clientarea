"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useAuthStore } from "@/lib/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TwoFactorSetup } from "@/components/auth/TwoFactor/TwoFactorSetup";
import {
    Shield,
    User,
    Lock,
    Save,
    Loader2,
    Mail,
    Phone,
    Smartphone,
    KeyRound,
    UserCheck,
    AlertCircle,
    ArrowLeft
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { PasswordStrength } from "@/components/shared/PasswordStrength";

export default function ProfilePage() {
    const { user, updateUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [is2FAModalOpen, set2FAModalOpen] = useState(false);

    const { register, handleSubmit, reset, watch } = useForm({
        defaultValues: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            email: user?.email || "",
            phoneNumber: user?.phoneNumber || "",
            whatsAppNumber: user?.whatsAppNumber || "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        }
    });

    // Reset form when user data changes (fixes sync/reload issues)
    useEffect(() => {
        if (user) {
            reset({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phoneNumber: user.phoneNumber || "",
                whatsAppNumber: user.whatsAppNumber || "",
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        }
    }, [user, reset]);

    // Handle profile info update
    const onUpdateProfile = async (data: any) => {
        setIsLoading(true);
        try {
            const response = await api.patch("/auth/update-me", {
                firstName: data.firstName,
                lastName: data.lastName,
                phoneNumber: data.phoneNumber,
                whatsAppNumber: data.whatsAppNumber,
            });

            if (response.data.status === 'success') {
                updateUser(response.data.data.user);
                toast.success("Profile updated successfully");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle password change with explicit verification phase
    const onUpdatePassword = async (data: any) => {
        if (!data.currentPassword) {
            return toast.error("Verification Required: Please enter your current master key");
        }

        if (!data.newPassword) {
            return toast.error("Invalid Entry: Please define a new access key");
        }

        // Strong Password Validation: 8+ chars, Capital, Number, Symbol
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        if (!passwordRegex.test(data.newPassword)) {
            return toast.error("Security Standard Not Met: New key must be 8+ characters and include a Capital letter, a Number, and a Symbol (@, #, !, etc.)");
        }

        if (data.newPassword !== data.confirmPassword) {
            return toast.error("Credential Mismatch: The repeat key does not match the original");
        }

        setIsLoading(true);
        const toastId = toast.loading("Verifying current credentials...");

        try {
            const response = await api.patch("/auth/update-me", {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });

            if (response.data.status === 'success') {
                toast.success("Security keys authorized and updated successfully", { id: toastId });
                reset({ ...watch(), currentPassword: "", newPassword: "", confirmPassword: "" });
            }
        } catch (err: any) {
            const message = err.response?.data?.message || "Authorization Failed: Current master key is incorrect";
            toast.error(message, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthGuard>
            <div className="min-h-screen bg-white text-foreground transition-colors duration-300">
                <Navbar />
                <Sidebar />
                <main className="pl-0 md:pl-75 pt-20 p-8 flex justify-center">
                    <div className="w-full max-w-4xl space-y-6">
                        {/* Header Section (Following Add Product Page Design) */}
                        <div className="flex items-center gap-4">
                            <Link href="/client">
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary/50">
                                    <ArrowLeft size={20} />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold">My Profile</h1>
                                <p className="text-muted-foreground">Manage your account settings and security preferences.</p>
                            </div>
                        </div>

                        {/* Main Form Container (Following Add Product Page Design) */}
                        <div className="glass rounded-[2rem] p-10 border border-white/5 shadow-2xl space-y-8">
                            <Tabs defaultValue="identity" className="w-full">
                                <TabsList className="mb-8 w-full justify-start bg-secondary/10 p-1 rounded-xl h-auto">
                                    <TabsTrigger value="identity" className="gap-2 px-6 py-2.5 rounded-lg text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                                        <User size={16} /> Identity
                                    </TabsTrigger>
                                    <TabsTrigger value="security" className="gap-2 px-6 py-2.5 rounded-lg text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                                        <Lock size={16} /> Security
                                    </TabsTrigger>
                                </TabsList>

                                {/* Identity Tab */}
                                <TabsContent value="identity" className="space-y-8 animate-in fade-in duration-300">
                                    <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">First Name</Label>
                                                <Input {...register("firstName")} className="bg-secondary/20 h-11 border-border rounded-xl font-medium" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Last Name</Label>
                                                <Input {...register("lastName")} className="bg-secondary/20 h-11 border-border rounded-xl font-medium" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                                                <Input {...register("phoneNumber")} className="bg-secondary/20 h-11 border-border rounded-xl font-medium" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">WhatsApp Number</Label>
                                                <Input {...register("whatsAppNumber")} className="bg-secondary/20 h-11 border-border rounded-xl font-medium" />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address (Read-Only)</Label>
                                            <Input {...register("email")} disabled className="bg-secondary/10 h-11 border-border rounded-xl font-medium opacity-60" />
                                            <p className="text-[10px] text-muted-foreground font-medium italic">Contact administration to modify your primary email record.</p>
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <Button type="submit" disabled={isLoading} className="h-11 px-8 rounded-xl font-bold shadow-lg shadow-primary/20 gap-2">
                                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                Save Changes
                                            </Button>
                                        </div>
                                    </form>
                                </TabsContent>

                                {/* Security Tab */}
                                <TabsContent value="security" className="space-y-8 animate-in fade-in duration-300">
                                    <form onSubmit={handleSubmit(onUpdatePassword)} className="space-y-8">
                                        <div className="p-6 bg-rose-500/5 rounded-2xl border border-rose-500/10 space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Shield className="text-rose-500" size={18} />
                                                <h3 className="text-sm font-bold text-rose-500">Security Verification</h3>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Password</Label>
                                                <Input type="password" {...register("currentPassword")} placeholder="Required to authorize change" className="bg-secondary/20 h-11 border-border rounded-xl font-medium" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">New Password</Label>
                                                <Input type="password" {...register("newPassword")} placeholder="Min. 8 characters" className="bg-secondary/20 h-11 border-border rounded-xl font-medium" />

                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Confirm New Password</Label>
                                                <Input type="password" {...register("confirmPassword")} placeholder="Repeat new password" className="bg-secondary/20 h-11 border-border rounded-xl font-medium" />
                                            </div>
                                        </div>

                                        <PasswordStrength password={watch("newPassword")} />

                                        <div className="flex justify-end pt-4">
                                            <Button type="submit" disabled={isLoading} className="h-11 px-8 rounded-xl font-bold shadow-lg shadow-primary/20 gap-2">
                                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                                                Update Security
                                            </Button>
                                        </div>
                                    </form>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>

                    <TwoFactorSetup isOpen={is2FAModalOpen} onClose={() => set2FAModalOpen(false)} />
                </main>
            </div>
        </AuthGuard>
    );
}
