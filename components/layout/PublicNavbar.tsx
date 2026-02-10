"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, Shield, Moon, Sun, ShoppingBag, Languages, LayoutDashboard, User, ChevronDown, Server } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useAuthStore } from "@/lib/store/authStore";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { useCartStore } from "@/lib/store/cartStore";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { motion } from "framer-motion";

export function PublicNavbar() {
    const { user, isAuthenticated } = useAuthStore();
    const { language } = useLanguage();
    const { settings } = useSettingsStore();
    const { items } = useCartStore();

    const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
    const [services, setServices] = React.useState<any[]>([]);
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
        const fetchServices = async () => {
            try {
                const res = await api.get("/products/services");
                setServices(res.data.data.services || []);
            } catch (e) {
                console.error("Failed to fetch services for nav", e);
            }
        };
        fetchServices();
    }, []);

    const navLinks = [
        { name: "Home", href: "/public" },
        { name: "Services", href: "/public/#hosting", hasDropdown: true },
        { name: "About Us", href: "/public/about" },
        { name: "Contact Us", href: "/public/contact" },
    ];

    const getDashboardLink = () => {
        if (!user) return "/auth/login";
        if (user.userType === 'ADMIN' || user.userType === 'SUPER_ADMIN') return "/admin";
        if (user.userType === 'RESELLER') return "/reseller";
        return "/client";
    };

    const getDashboardLabel = () => {
        if (user?.userType === 'ADMIN' || user?.userType === 'SUPER_ADMIN') return "Admin Panel";
        return "Client Area";
    };

    return (
        <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-background/80 backdrop-blur-xl border-b border-border shadow-sm">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/public" className="flex items-center gap-2 group">
                    <img
                        src="/Facreativefirmltd.png"
                        alt="FA Creative CRM Logo"
                        className="w-10 h-10 object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="text-xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                        {settings.appName || 'FA Creative CRM'}
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-2">
                    {navLinks.map((link) => (
                        <div
                            key={link.name}
                            className="relative group"
                            onMouseEnter={() => link.hasDropdown && setActiveDropdown(link.name)}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <Link
                                href={link.href}
                                className="text-sm font-bold text-muted-foreground hover:text-primary transition-all px-4 py-2 rounded-xl flex items-center gap-1 group-hover:bg-primary/5"
                            >
                                {link.name}
                                {link.hasDropdown && <ChevronDown size={14} className={cn("transition-transform duration-300", activeDropdown === link.name && "rotate-180")} />}
                            </Link>

                            {/* Dropdown Menu */}
                            {link.hasDropdown && activeDropdown === link.name && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute top-full left-0 mt-1 w-64 bg-card border border-border rounded-2xl shadow-2xl p-4 grid gap-2"
                                >
                                    {services.map((service) => (
                                        <Link
                                            key={service.id}
                                            href={`/public/services/${service.slug}`}
                                            className="p-3 rounded-xl hover:bg-primary/5 flex items-center gap-3 transition-colors group/item"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover/item:text-primary group-hover/item:bg-primary/10 transition-colors">
                                                <Server size={16} />
                                            </div>
                                            <div className="text-sm font-bold text-foreground group-hover/item:text-primary">
                                                {service.name}
                                            </div>
                                        </Link>
                                    ))}
                                    {services.length === 0 && (
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center py-4">
                                            Scanning Services...
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <Link href="/checkout" className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
                        <ShoppingBag size={22} />
                        {isMounted && items.length > 0 && (
                            <span className="absolute top-0 right-0 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                {items.length}
                            </span>
                        )}
                    </Link>

                    {isAuthenticated ? (
                        <Link href={getDashboardLink()}>
                            <Button className="rounded-xl font-bold bg-[#f37021] text-white shadow-lg shadow-[#f37021]/20 hover:bg-[#d9621c] transition-all px-6 gap-2">
                                <LayoutDashboard className="w-4 h-4" />
                                {getDashboardLabel()}
                            </Button>
                        </Link>
                    ) : (
                        <>
                            <Link href="/auth/login">
                                <Button variant="ghost" className="rounded-xl font-bold text-muted-foreground hover:text-primary hover:bg-transparent">
                                    Login
                                </Button>
                            </Link>
                            <Link href="/auth/register">
                                <Button className="rounded-xl font-bold bg-[#f37021] text-white shadow-lg shadow-[#f37021]/20 hover:bg-[#d9621c] transition-all px-6">
                                    Get Started
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu */}
                <div className="md:hidden flex items-center gap-3">
                    <Link href="/checkout" className="relative p-2 text-muted-foreground">
                        <ShoppingBag size={22} />
                        {isMounted && items.length > 0 && (
                            <span className="absolute top-0 right-0 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                {items.length}
                            </span>
                        )}
                    </Link>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="w-6 h-6 text-foreground" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="bg-background p-0 border-l border-border">
                            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                            <div className="flex flex-col h-full bg-background p-6">
                                <div className="flex items-center gap-2 mb-10">
                                    <img
                                        src="/Facreativefirmltd.png"
                                        alt="Logo"
                                        className="w-10 h-10 object-contain"
                                    />
                                    <span className="text-xl font-bold text-foreground">{settings.appName || 'FA CRM'}</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {navLinks.map((link) => (
                                        <React.Fragment key={link.name}>
                                            <Link
                                                href={link.href}
                                                className="text-lg font-medium text-muted-foreground hover:text-primary hover:bg-muted px-4 py-3 rounded-xl transition-colors"
                                            >
                                                {link.name}
                                            </Link>
                                            {link.hasDropdown && (
                                                <div className="pl-6 flex flex-col gap-1 border-l-2 border-border ml-4 mb-4">
                                                    {services.map((service) => (
                                                        <Link
                                                            key={service.id}
                                                            href={`/public/services/${service.slug}`}
                                                            className="text-sm font-bold text-muted-foreground hover:text-primary py-2"
                                                        >
                                                            {service.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </React.Fragment>
                                    ))}
                                    <div className="h-[1px] bg-border my-4" />

                                    {isAuthenticated ? (
                                        <Link href={getDashboardLink()} className="w-full">
                                            <Button className="w-full rounded-xl font-bold py-6 text-base shadow-lg shadow-primary/20 gap-2">
                                                <LayoutDashboard className="w-5 h-5" />
                                                {getDashboardLabel()}
                                            </Button>
                                        </Link>
                                    ) : (
                                        <>
                                            <Link href="/auth/login" className="w-full">
                                                <Button variant="outline" className="w-full rounded-xl font-bold py-6 text-base border-border">
                                                    Log In
                                                </Button>
                                            </Link>
                                            <Link href="/auth/register" className="w-full">
                                                <Button className="w-full rounded-xl font-bold py-6 text-base shadow-lg shadow-[#f37021]/20 bg-[#f37021] hover:bg-[#d9621c] text-white">
                                                    Get Started
                                                </Button>
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    );
}
