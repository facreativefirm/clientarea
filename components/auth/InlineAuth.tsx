"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, LogIn, UserPlus, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore, setSessionToken } from "@/lib/store/authStore";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useWhiteLabel } from "@/components/white-label-provider";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const loginSchema = z.object({
    identifier: z.string().min(3, "Username or email is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

const registerSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phoneNumber: z.string().min(1, "Phone number is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

interface InlineAuthProps {
    onSuccess: () => void;
}

export function InlineAuth({ onSuccess }: InlineAuthProps) {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const { setAuth } = useAuthStore();
    const { isReseller, resellerId, brand } = useWhiteLabel();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const loginForm = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const registerForm = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
    });

    const onLoginSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post("/auth/login", data);
            const { user, sessionToken } = response.data.data;
            setSessionToken(sessionToken);
            setAuth(user, sessionToken);
            toast.success("Welcome back!");
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid credentials");
        } finally {
            setIsLoading(false);
        }
    };

    const onRegisterSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        setError(null);
        try {
            await api.post("/auth/register", {
                username: data.username,
                email: data.email,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
                phoneNumber: data.phoneNumber,
                resellerId: isReseller ? resellerId : null,
            });

            // Automatically login after registration
            const loginRes = await api.post("/auth/login", {
                identifier: data.username,
                password: data.password
            });
            const { user, sessionToken } = loginRes.data.data;
            setSessionToken(sessionToken);
            setAuth(user, sessionToken);

            toast.success("Account created successfully!");
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="flex bg-muted/50 p-1.5 rounded-2xl mb-8 border border-border max-w-sm mx-auto">
                <button
                    onClick={() => setMode('login')}
                    className={cn(
                        "flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        mode === 'login' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Already Agent
                </button>
                <button
                    onClick={() => setMode('register')}
                    className={cn(
                        "flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        mode === 'register' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    New Recruitment
                </button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={mode}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-2xl font-black uppercase tracking-tight text-foreground leading-none mb-2">
                                {mode === 'login'
                                    ? (brand?.name ? `Access ${brand.name}` : "Access Profile")
                                    : (brand?.name ? `Join ${brand.name}` : "Create Identity")
                                }
                            </h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                {mode === 'login' ? "Resume your deployment protocol" : "Register on the decentralized network"}
                            </p>
                        </div>

                        {error && (
                            <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/20 text-destructive text-[11px] font-black uppercase tracking-wider text-center animate-shake">
                                {error}
                            </div>
                        )}

                        {mode === 'login' ? (
                            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest font-black opacity-50 ml-1">Username / Email</Label>
                                    <Input
                                        {...loginForm.register("identifier")}
                                        placeholder="Enter identifiers"
                                        className="h-12 rounded-xl bg-background border-border/50 focus:border-primary transition-all px-4 font-medium"
                                    />
                                    {loginForm.formState.errors.identifier && <p className="text-[10px] text-destructive font-bold uppercase tracking-widest">{loginForm.formState.errors.identifier.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest font-black opacity-50 ml-1">Access Key</Label>
                                    <Input
                                        {...loginForm.register("password")}
                                        type="password"
                                        placeholder="••••••••"
                                        className="h-12 rounded-xl bg-background border-border/50 focus:border-primary transition-all px-4 font-medium"
                                    />
                                    {loginForm.formState.errors.password && <p className="text-[10px] text-destructive font-bold uppercase tracking-widest">{loginForm.formState.errors.password.message}</p>}
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] bg-primary text-white hover:bg-primary/90 mt-4 group"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                        <>
                                            Execute Login
                                            <LogIn size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase tracking-widest font-black opacity-50 ml-1">First Name</Label>
                                        <Input {...registerForm.register("firstName")} placeholder="John" className="h-12 rounded-xl font-medium" />
                                        {registerForm.formState.errors.firstName && <p className="text-[10px] text-destructive font-bold uppercase tracking-widest">{registerForm.formState.errors.firstName.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase tracking-widest font-black opacity-50 ml-1">Last Name</Label>
                                        <Input {...registerForm.register("lastName")} placeholder="Doe" className="h-12 rounded-xl font-medium" />
                                        {registerForm.formState.errors.lastName && <p className="text-[10px] text-destructive font-bold uppercase tracking-widest">{registerForm.formState.errors.lastName.message}</p>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest font-black opacity-50 ml-1">Username</Label>
                                    <Input {...registerForm.register("username")} placeholder="johndoe" className="h-12 rounded-xl font-medium" />
                                    {registerForm.formState.errors.username && <p className="text-[10px] text-destructive font-bold uppercase tracking-widest">{registerForm.formState.errors.username.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest font-black opacity-50 ml-1">Email Address</Label>
                                    <Input {...registerForm.register("email")} type="email" placeholder="john@domain.com" className="h-12 rounded-xl font-medium" />
                                    {registerForm.formState.errors.email && <p className="text-[10px] text-destructive font-bold uppercase tracking-widest">{registerForm.formState.errors.email.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest font-black opacity-50 ml-1">Phone Number</Label>
                                    <Input {...registerForm.register("phoneNumber")} placeholder="+8801..." className="h-12 rounded-xl font-medium" />
                                    {registerForm.formState.errors.phoneNumber && <p className="text-[10px] text-destructive font-bold uppercase tracking-widest">{registerForm.formState.errors.phoneNumber.message}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase tracking-widest font-black opacity-50 ml-1">Cipher Key</Label>
                                        <Input {...registerForm.register("password")} type="password" placeholder="••••••••" className="h-12 rounded-xl font-medium" />
                                        {registerForm.formState.errors.password && <p className="text-[10px] text-destructive font-bold uppercase tracking-widest">{registerForm.formState.errors.password.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase tracking-widest font-black opacity-50 ml-1">Confirm</Label>
                                        <Input {...registerForm.register("confirmPassword")} type="password" placeholder="••••••••" className="h-12 rounded-xl font-medium" />
                                        {registerForm.formState.errors.confirmPassword && <p className="text-[10px] text-destructive font-bold uppercase tracking-widest">{registerForm.formState.errors.confirmPassword.message}</p>}
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] bg-primary text-white hover:bg-primary/90 mt-4 group"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                        <>
                                            Complete Onboarding
                                            <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
