"use client";

import React from "react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/components/language-provider";
import { useAuthStore } from "@/lib/store/authStore";
import { useRouter } from "next/navigation";
import {
    Moon,
    Sun,
    Search,
    User,
    Settings,
    LogOut,
    Shield,
    ShoppingCart,
    Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cartStore";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { IntelliSearch } from "@/components/admin/IntelliSearch";

import { useUIStore } from "@/lib/store/uiStore";

import { toast } from "sonner";
import { socketService } from "@/lib/socket";

export function Navbar() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const { language, toggleLanguage } = useLanguage();
    const { user, logout } = useAuthStore();
    const { items } = useCartStore();
    const { toggleSidebar } = useUIStore();

    // WebSocket Integration (Admin Alerts & Notifications)
    React.useEffect(() => {
        if (!user) return;

        const socket = socketService.connect();

        // 1. Specific Admin Ticket Alerts
        const handleNewTicket = (ticket: any) => {
            if (!['ADMIN', 'SUPER_ADMIN', 'STAFF'].includes(user.userType)) return;

            toast.info(`New Support Ticket`, {
                description: `#${ticket.ticketNumber}: ${ticket.subject}`,
                action: {
                    label: "View",
                    onClick: () => router.push(`/admin/support/${ticket.id}`)
                },
                duration: 10000
            });

            // Alert sound
            const alertSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3");
            alertSound.play().catch(() => { });
        };

        // 2. General Notifications (for everyone)
        const handleNewNotification = (notification: any) => {
            // Support chat handles its own notifications, so we might want to skip those here 
            // if we don't want duplicate toasts. But for other things like billing/orders, it's great.

            toast(notification.title, {
                description: notification.message,
                icon: <Shield className="w-4 h-4 text-primary" />,
                action: notification.link ? {
                    label: "View",
                    onClick: () => router.push(notification.link!)
                } : undefined,
                duration: 8000
            });

            const alertSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3");
            alertSound.play().catch(() => { });
        };

        socket.on('new_ticket', handleNewTicket);
        socket.on('new_notification', handleNewNotification);

        return () => {
            socket.off('new_ticket', handleNewTicket);
            socket.off('new_notification', handleNewNotification);
        };
    }, [user, router]);

    const handleLogout = () => {
        logout();
        router.push("/auth/login");
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <nav className="sticky top-0 z-50 w-full glass border-b border-white/5 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-8 flex-1 justify-between md:justify-start">
                <div onClick={() => router.push("/")} className="cursor-pointer flex items-center gap-2 group min-w-fit">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform">
                        <Shield className="w-6 h-6" />
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hidden sm:block">
                        WHMCS CRM
                    </h1>
                </div>

                <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
                    <Menu className="w-6 h-6" />
                </Button>

                {user?.userType === 'ADMIN' || user?.userType === 'SUPER_ADMIN' ? (
                    <IntelliSearch />
                ) : (
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="bg-secondary/50 border-none rounded-full pl-10 pr-4 py-1.5 text-sm focus:ring-1 focus:ring-primary w-64 transition-all"
                        />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleLanguage()}
                    className="rounded-full"
                    title={language === "en" ? "Bangla" : "English"}
                >
                    <span className="ml-1 text-xs font-bold uppercase">{language}</span>
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="rounded-full"
                >
                    {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>


                {(user?.userType === 'CLIENT' || user?.userType === 'RESELLER') && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full relative"
                        onClick={() => router.push("/client/checkout")}
                    >
                        <ShoppingCart className="w-5 h-5" />
                        {items.length > 0 && (
                            <span className="absolute top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                {items.length}
                            </span>
                        )}
                    </Button>
                )}

                <div className="h-8 w-[1px] bg-border mx-2"></div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="gap-2 rounded-full pl-2 pr-4 hover:bg-secondary/50">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xs">
                                {user ? getInitials(`${user.username}`) : '??'}
                            </div>
                            <span className="text-sm font-medium hidden sm:inline-block">
                                {user ? `${user.username}` : 'Guest'}
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push("/profile")}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>

                        {/* Hybrid view switching for Resellers */}
                        {user?.userType === 'RESELLER' && (
                            <>
                                {router && !window.location.pathname.startsWith('/client') ? (
                                    <DropdownMenuItem onClick={() => router.push("/client")} className="bg-primary/5 text-primary font-bold">
                                        <Shield className="mr-2 h-4 w-4" />
                                        <span>Switch to Client View</span>
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem onClick={() => router.push("/reseller")} className="bg-primary/5 text-primary font-bold">
                                        <Shield className="mr-2 h-4 w-4 text-[#f37021]" />
                                        <span>Switch to Reseller View</span>
                                    </DropdownMenuItem>
                                )}
                            </>
                        )}

                        <DropdownMenuItem onClick={() => router.push("/settings")}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log Out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </nav>
    );
}
