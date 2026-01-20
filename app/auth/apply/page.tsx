"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Send, ShieldCheck, UserCircle, Mail, Smartphone, Key, Building2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { useWhiteLabel } from "@/components/white-label-provider";
import { useSettingsStore } from "@/lib/store/settingsStore";

const applySchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phoneNumber: z.string().min(1, "Phone number is required"),
    userType: z.string().min(1, "Please select an account type"),
    reason: z.string().min(10, "Please provide a more detailed reason (min 10 chars)"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ApplyFormValues = z.infer<typeof applySchema>;

export default function ApplyPage() {
    const router = useRouter();
    const { brand } = useWhiteLabel();
    const { settings, fetchSettings } = useSettingsStore();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const appName = brand?.name || settings?.appName || "Platform";

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ApplyFormValues>({
        resolver: zodResolver(applySchema),
    });

    const userType = watch("userType");

    const onSubmit = async (data: ApplyFormValues) => {
        setIsLoading(true);
        setError(null);
        try {
            await api.post("/user-applications/apply", data);
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || "Submission failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/20 via-background to-background">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full glass p-10 rounded-[3rem] shadow-2xl border-white/5 text-center space-y-6"
                >
                    <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10 border border-emerald-500/20">
                        <ShieldCheck className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Application Received</h2>
                    <p className="text-muted-foreground font-medium leading-relaxed">
                        Your request for a <strong>{userType}</strong> account at <strong>{appName}</strong> has been submitted for review.
                        We will notify you at your email address once our administrators have processed your application.
                    </p>
                    <div className="pt-6">
                        <Link href="/auth/login">
                            <Button className="w-full h-12 rounded-2xl font-bold bg-accent text-accent-foreground hover:bg-accent/90 transition-all">
                                Return to Login
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/20 via-background to-background">
            <div className="w-full max-w-xl py-12">
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-accent/10 text-accent mb-4 border border-accent/20 shadow-xl shadow-accent/10"
                    >
                        {brand?.logoUrl ? (
                            <img src={brand.logoUrl} alt={appName} className="w-10 h-10 object-contain" />
                        ) : (
                            <UserPlus className="w-8 h-8" />
                        )}
                    </motion.div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {appName} Access Portal
                    </h1>
                    <p className="text-muted-foreground mt-2">Request professional access to the ecosystem</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-[2.5rem] p-8 md:p-10 shadow-2xl border-white/5 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-primary to-accent opacity-50"></div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Account Type</Label>
                            <Select onValueChange={(val) => setValue("userType", val as any)}>
                                <SelectTrigger className="rounded-xl border-white/10 bg-white/5">
                                    <SelectValue placeholder="Select Access Type" />
                                </SelectTrigger>
                                <SelectContent className="bg-background border-white/10">
                                    <SelectItem value="STAFF">Staff / Sales Member</SelectItem>
                                    <SelectItem value="RESELLER">Reseller Account</SelectItem>
                                    <SelectItem value="ADMIN">System Administrator</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.userType && <p className="text-[11px] font-bold text-destructive uppercase tracking-wider">{errors.userType.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input id="firstName" placeholder="John" {...register("firstName")} className="rounded-xl border-white/10 bg-white/5" />
                                {errors.firstName && <p className="text-[11px] font-bold text-destructive uppercase tracking-wider">{errors.firstName.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input id="lastName" placeholder="Doe" {...register("lastName")} className="rounded-xl border-white/10 bg-white/5" />
                                {errors.lastName && <p className="text-[11px] font-bold text-destructive uppercase tracking-wider">{errors.lastName.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" placeholder="johndoe_staff" {...register("username")} className="rounded-xl border-white/10 bg-white/5" />
                                {errors.username && <p className="text-[11px] font-bold text-destructive uppercase tracking-wider">{errors.username.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" placeholder="john@enterprise.com" {...register("email")} className="rounded-xl border-white/10 bg-white/5" />
                                {errors.email && <p className="text-[11px] font-bold text-destructive uppercase tracking-wider">{errors.email.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Contact Number</Label>
                            <Input id="phoneNumber" placeholder="+1234567890" {...register("phoneNumber")} className="rounded-xl border-white/10 bg-white/5" />
                            {errors.phoneNumber && <p className="text-[11px] font-bold text-destructive uppercase tracking-wider">{errors.phoneNumber.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason for Request</Label>
                            <Textarea id="reason" placeholder="Briefly describe your role..." className="min-h-[100px] rounded-xl border-white/10 bg-white/5 resize-none" {...register("reason")} />
                            {errors.reason && <p className="text-[11px] font-bold text-destructive uppercase tracking-wider">{errors.reason.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" placeholder="••••••••" {...register("password")} className="rounded-xl border-white/10 bg-white/5" />
                                {errors.password && <p className="text-[11px] font-bold text-destructive uppercase tracking-wider">{errors.password.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input id="confirmPassword" type="password" placeholder="••••••••" {...register("confirmPassword")} className="rounded-xl border-white/10 bg-white/5" />
                                {errors.confirmPassword && <p className="text-[11px] font-bold text-destructive uppercase tracking-wider">{errors.confirmPassword.message}</p>}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 rounded-2xl text-base font-bold shadow-lg shadow-accent/20 hover:scale-[1.01] active:scale-[0.99] transition-all bg-accent text-accent-foreground hover:bg-accent/90"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Submitting Request...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-5 w-5" />
                                    Apply For Access
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 text-center border-t border-white/5 pt-6">
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/auth/login" className="text-accent font-bold hover:underline">
                                Sign In Now
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
