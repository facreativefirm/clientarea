"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard allowedRoles={["CLIENT", "RESELLER"]}>
            {children}
        </AuthGuard>
    );
}
