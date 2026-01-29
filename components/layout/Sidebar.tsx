"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/language-provider";
import {
    LayoutDashboard,
    Users,
    Server,
    CreditCard,
    LifeBuoy,
    Share2,
    Settings,
    LogOut,
    ShoppingCart,
    Wallet,
    Globe,
    ChevronDown,
    ChevronRight,
    Wrench,
    ShieldCheck,
    BarChart3,
    FileText,
    Zap,
    TrendingUp,
    DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/authStore";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/lib/store/uiStore";

interface MenuItem {
    name: string;
    icon: any;
    href?: string;
    children?: { name: string; href: string }[];
}

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { language, toggleLanguage } = useLanguage();
    const { user, logout } = useAuthStore();
    const { isSidebarOpen, setSidebarOpen } = useUIStore();
    const [openMenus, setOpenMenus] = useState<string[]>([]);

    const toggleMenu = (name: string) => {
        setOpenMenus(prev =>
            prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]
        );
    };

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const getMenuItems = (): MenuItem[] => {
        const role = user?.userType;

        if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
            return [
                // ... (existing admin menus)
                { name: "Dashboard", icon: LayoutDashboard, href: "/admin" },
                {
                    name: "User Management",
                    icon: Users,
                    children: [
                        { name: "Internal Requests", href: "/admin/applications" },
                        { name: "View All Clients", href: "/admin/clients" },
                        { name: "Resellers", href: "/admin/resellers" },
                        { name: "Add New Client", href: "/admin/clients/add" },
                        { name: "Client Groups", href: "/admin/clients/groups" },
                    ]
                },
                {
                    name: "Orders",
                    icon: ShoppingCart,
                    children: [
                        { name: "List All Orders", href: "/admin/orders" },
                        { name: "Pending Orders", href: "/admin/orders?status=Pending" },
                        { name: "Add New Order", href: "/admin/orders/add" }
                    ]
                },
                {
                    name: "Products",
                    icon: ShoppingCart,
                    children: [
                        { name: "View All Products", href: "/admin/products" },
                        { name: "Add New Product", href: "/admin/products/add" },
                        { name: "Services", href: "/admin/products/services" },
                        { name: "Add Service", href: "/admin/products/services/add" }
                    ]
                },
                {
                    name: "Domains",
                    icon: Globe,
                    children: [
                        { name: "List All Domains", href: "/admin/domains" },
                        { name: "Register Domain", href: "/admin/domains/register" },
                        { name: "Expiring Domains", href: "/admin/domains/expiring" },
                        { name: "TLD Pricing", href: "/admin/domains/tlds" },
                        { name: "WHOIS Lookup", href: "/admin/utilities/whois" }
                    ]
                },
                {
                    name: "Billing",
                    icon: CreditCard,
                    children: [
                        { name: "Invoices", href: "/admin/billing" },
                        { name: "Quotes", href: "/admin/billing/quotes" },
                        { name: "Transactions", href: "/admin/billing?tab=transactions" },
                        { name: "Refunds", href: "/admin/billing/refunds" },
                        { name: "Create Invoice", href: "/admin/billing/create" },
                    ]
                },
                {
                    name: "Services",
                    icon: Server,
                    children: [
                        { name: "All Services", href: "/admin/services" },
                        { name: "Expiring Soon", href: "/admin/services/expiring" },
                        { name: "Bulk Setup", href: "/admin/services/bulk" }
                    ]
                },
                {
                    name: "Investors",
                    icon: DollarSign,
                    children: [
                        { name: "Manage Investors", href: "/admin/investors" },
                        { name: "Withdrawals", href: "/admin/investors/payouts" }
                    ]
                },
                {
                    name: "Support",
                    icon: LifeBuoy,
                    children: [
                        { name: "Support Tickets", href: "/admin/support?tab=tickets" },
                        { name: "Network Status", href: "/admin/support?tab=network" },
                        { name: "Predefined Replies", href: "/admin/support?tab=replies" }
                    ]
                },
                {
                    name: "Utilities",
                    icon: Wrench,
                    children: [
                        { name: "WHOIS Lookup", href: "/admin/utilities/whois" },
                        { name: "DNS Resolver", href: "/admin/utilities/dns" },
                        { name: "TLD Sync", href: "/admin/utilities/tldsync" },
                        { name: "Import/Export", href: "/admin/utilities/import-export" },
                    ]
                },
                {
                    name: "Security",
                    icon: ShieldCheck,
                    children: [
                        { name: "Banned IPs", href: "/admin/security/banned-ips" },
                        { name: "Security Questions", href: "/admin/security/questions" }
                    ]
                },
                {
                    name: "Sales Team",
                    icon: TrendingUp,
                    children: [
                        { name: "Sales Overview", href: "/admin/sales-team" },
                        { name: "Verifications", href: "/admin/sales-team/verifications" },
                        { name: "Withdrawals", href: "/admin/sales-team/withdrawals" },
                    ]
                },
                { name: "Reports", icon: BarChart3, href: "/admin/reports" },
            ];
        }

        if (role === 'RESELLER' && !pathname.startsWith('/client')) {
            return [
                { name: "Dashboard", icon: LayoutDashboard, href: "/reseller" },
                {
                    name: "Client Relations",
                    icon: Users,
                    children: [
                        { name: "Client CRM", href: "/reseller/clients" },
                    ]
                },
                {
                    name: "Merchandise",
                    icon: Server,
                    children: [
                        { name: "Active Services", href: "/reseller/services" },
                        { name: "Order History", href: "/reseller/orders" },
                        { name: "Invoices & Billing", href: "/reseller/invoices" },
                    ]
                },
                { name: "Product Catalog", icon: ShoppingCart, href: "/reseller/products" },
                { name: "Payouts", icon: Wallet, href: "/reseller/payouts" },
                { name: "White-Label Config", icon: Zap, href: "/reseller/settings" },
                { name: "Help & Support", icon: LifeBuoy, href: "/support" },
                { name: "Switch to Client View", icon: ShieldCheck, href: "/client" },
            ];
        }

        if (role === 'INVESTOR') {
            return [
                { name: "Dashboard", icon: LayoutDashboard, href: "/investor" },
                { name: "My Commissions", icon: DollarSign, href: "/investor/commissions" },
                { name: "Withdrawals", icon: Wallet, href: "/investor/payouts" },
                { name: "Profile", icon: Users, href: "/profile" },
                { name: "Logout", icon: LogOut, href: "/" },
            ];
        }

        // Default Client Menu (for CLIENT role or RESELLER in personal view)
        const clientMenu = [
            { name: "Dashboard", icon: LayoutDashboard, href: "/client" },
            { name: "Store", icon: ShoppingCart, href: "/client/store" },
            { name: "Services", icon: Server, href: "/client/services" },
            { name: "Domains", icon: Globe, href: "/client/domains" },
            { name: "Billing", icon: CreditCard, href: "/client/billing" },
            { name: "Quotes", icon: FileText, href: "/client/quotes" },
            { name: "Transactions", icon: FileText, href: "/client/transactions" },
        ];

        // If reseller is in client view, add a quick link back to reseller dashboard
        if (role === 'RESELLER') {
            clientMenu.push({ name: "Back to Reseller", icon: ShieldCheck, href: "/reseller" });
        }

        return clientMenu;
    };

    const menuItems = getMenuItems();

    return (
        <>
            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside className={cn(
                "w-64 h-[calc(100vh-64px)] fixed left-0 top-16 glass border-r border-white/5 flex flex-col p-4 z-40 overflow-y-auto custom-scrollbar transition-transform duration-300 lg:translate-x-0 lg:flex",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex-1 space-y-1">
                    {menuItems.map((item) => {
                        const hasChildren = item.children && item.children.length > 0;
                        const isOpen = openMenus.includes(item.name);
                        const isActive = item.href ? pathname === item.href : item.children?.some(c => pathname === c.href);

                        return (
                            <div key={item.name} className="space-y-1">
                                {item.href ? (
                                    <Link
                                        href={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                                            pathname === item.href
                                                ? (pathname.startsWith('/reseller')
                                                    ? "bg-secondary text-white shadow-lg shadow-secondary/20"
                                                    : "bg-primary text-primary-foreground shadow-lg shadow-primary/20")
                                                : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <item.icon className={cn("w-4 h-4", pathname === item.href ? "" : "group-hover:scale-110 transition-transform")} />
                                        <span>{item.name}</span>
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => toggleMenu(item.name)}
                                        className={cn(
                                            "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                                            isActive && !isOpen
                                                ? (pathname.startsWith('/reseller')
                                                    ? "bg-secondary/10 text-secondary border border-secondary/20"
                                                    : "bg-primary/10 text-primary border border-primary/20")
                                                : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            <span>{item.name}</span>
                                        </div>
                                        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    </button>
                                )}

                                {hasChildren && isOpen && (
                                    <div className="ml-9 space-y-1 border-l border-white/5 pl-2 mt-1">
                                        {item.children!.map((child) => (
                                            <Link
                                                key={child.href}
                                                href={child.href}
                                                onClick={() => setSidebarOpen(false)}
                                                className={cn(
                                                    "block px-4 py-2 rounded-lg text-xs transition-all",
                                                    pathname === child.href
                                                        ? (pathname.startsWith('/reseller')
                                                            ? "bg-secondary/10 text-secondary font-black"
                                                            : "bg-primary/10 text-primary font-black")
                                                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground font-medium"
                                                )}
                                            >
                                                {child.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="border-t border-white/5 mt-4 pt-4 space-y-1">
                    <Link
                        href="/admin/settings"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-all"
                    >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
