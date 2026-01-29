"use client";

import { usePathname } from "next/navigation";
import { FloatingNotifications } from "./FloatingNotifications";
import { FloatingChat } from "./FloatingChat";

export function FloatingPortal() {
    const pathname = usePathname();

    // Define public routes where we strictly want the Chat instead of Notifications
    const isPublicRoute =
        pathname === "/" ||
        pathname.startsWith("/pricing") ||
        pathname.startsWith("/checkout") ||
        pathname.startsWith("/auth") ||
        pathname.startsWith("/prospect") ||
        pathname.startsWith("/about") ||
        pathname.startsWith("/contact");

    // Dashboard routes where we want Notifications
    const isDashboardRoute =
        pathname.startsWith("/admin") ||
        pathname.startsWith("/client") ||
        pathname.startsWith("/reseller") ||
        pathname.startsWith("/investor") ||
        pathname.startsWith("/sales-team");

    return (
        <>
            {/* Show Chat universally (Public + Dashboard) */}
            <FloatingChat />

            {/* Show Notifications only on dashboard routes, shifted left to avoid overlap */}
            {isDashboardRoute && (
                <FloatingNotifications className="right-30 bottom-6" />
            )}
        </>
    );
}
