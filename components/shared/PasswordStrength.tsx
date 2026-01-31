"use client";

import React, { useMemo } from "react";
import { Check, X, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
    password?: string;
    className?: string;
    hideLabel?: boolean;
}

export function PasswordStrength({ password = "", className, hideLabel = false }: PasswordStrengthProps) {
    const requirements = useMemo(() => [
        { label: "8+ Characters", met: password.length >= 8 },
        { label: "One Capital Letter", met: /[A-Z]/.test(password) },
        { label: "One Number", met: /[0-9]/.test(password) },
        { label: "One Special Symbol", met: /[^A-Za-z0-9]/.test(password) },
    ], [password]);

    const strength = useMemo(() => {
        const metCount = requirements.filter(r => r.met).length;
        if (metCount === 0) return { label: "Very Weak", color: "bg-muted", text: "text-muted-foreground", width: "w-0", icon: ShieldAlert };
        if (metCount === 1) return { label: "Weak", color: "bg-rose-500", text: "text-rose-500", width: "w-1/4", icon: ShieldAlert };
        if (metCount === 2) return { label: "Fair", color: "bg-orange-500", text: "text-orange-500", width: "w-2/4", icon: ShieldAlert };
        if (metCount === 3) return { label: "Good", color: "bg-blue-500", text: "text-blue-500", width: "w-3/4", icon: Shield };
        return { label: "Strong", color: "bg-emerald-500", text: "text-emerald-500", width: "w-full", icon: ShieldCheck };
    }, [requirements]);

    if (!password && !hideLabel) return null;

    return (
        <div className={cn("space-y-3", className)}>
            {!hideLabel && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <strength.icon className={cn("w-4 h-4", strength.text)} />
                        <span className={cn("text-[10px] font-black uppercase tracking-widest", strength.text)}>
                            Security Level: {strength.label}
                        </span>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground">
                        {requirements.filter(r => r.met).length}/4
                    </span>
                </div>
            )}

            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-secondary/30 rounded-full overflow-hidden border border-white/5">
                <div className={cn("h-full transition-all duration-500", strength.color, strength.width)} />
            </div>

            {/* Checklist */}
            {!hideLabel && (
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                    {requirements.map((req, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className={cn(
                                "p-0.5 rounded-full transition-colors",
                                req.met ? "bg-emerald-500/20 text-emerald-500" : "bg-secondary/50 text-muted-foreground/30"
                            )}>
                                {req.met ? <Check size={10} strokeWidth={4} /> : <X size={10} strokeWidth={4} />}
                            </div>
                            <span className={cn(
                                "text-[9px] font-bold uppercase tracking-tight transition-colors",
                                req.met ? "text-emerald-500" : "text-muted-foreground"
                            )}>
                                {req.label}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
