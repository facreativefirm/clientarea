"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Briefcase,
    Users,
    DollarSign,
    BarChart,
    LayoutDashboard,
    LogOut,
    UserPlus,
    Menu,
    ChevronRight,
    Shield,
    X,
    PanelLeftClose,
    PanelLeft
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export default function SalesTeamLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const navItems = [
        { name: "Dashboard", href: "/sales-team", icon: LayoutDashboard },
        { name: "Add Prospect", href: "/sales-team/prospects/new", icon: UserPlus },
        { name: "My Prospects", href: "/sales-team/prospects", icon: Users },
        { name: "Points & Wallet", href: "/sales-team/points", icon: DollarSign },
        { name: "Performance", href: "/sales-team/performance", icon: BarChart },
    ];

    const handleLogout = () => {
        logout();
        router.push("/auth/login");
    };

    return (
        <div className="min-h-screen bg-[#fafafa] flex font-sans">
            {/* Sidebar Desktop */}
            <aside
                className={cn(
                    "bg-white/80 backdrop-blur-xl border-r border-gray-100 transition-all duration-500 hidden md:flex flex-col fixed h-full z-40 shadow-2xl shadow-gray-200/20",
                    isSidebarOpen ? "w-[300px]" : "w-[100px]"
                )}
            >
                <div className="p-8 pb-12 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-[1.25rem] bg-gradient-to-br from-[#1a1a1a] to-[#444] flex items-center justify-center text-white shadow-xl shadow-gray-200 group-hover:scale-110 transition-transform">
                            <Shield className="h-6 w-6" />
                        </div>
                        <AnimatePresence>
                            {isSidebarOpen && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="font-black text-2xl text-gray-900 tracking-tighter"
                                >
                                    Sales<span className="text-primary italic">Hub</span>
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Link>

                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors text-gray-400 hover:text-gray-900"
                    >
                        {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
                    </button>
                </div>

                <div className="flex-1 px-4 space-y-1.5 overflow-y-auto">
                    <div className="mb-4 px-4">
                        <p className={cn(
                            "text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]",
                            !isSidebarOpen && "text-center px-0"
                        )}>
                            {isSidebarOpen ? "Main Navigation" : "Nav"}
                        </p>
                    </div>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                                    isActive
                                        ? "bg-primary text-white shadow-xl shadow-primary/20"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <div className={cn(
                                    "h-6 w-6 shrink-0 flex items-center justify-center",
                                    isActive ? "text-white" : "group-hover:scale-110 transition-transform"
                                )}>
                                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                {isSidebarOpen && (
                                    <span className="font-extrabold text-sm tracking-tight">{item.name}</span>
                                )}
                                {isActive && isSidebarOpen && (
                                    <motion.div layoutId="nav-dot" className="h-1.5 w-1.5 rounded-full bg-white ml-auto" />
                                )}
                            </Link>
                        );
                    })}
                </div>

                <div className="p-6 border-t border-gray-50 bg-gray-50/30">
                    <div className={cn(
                        "flex items-center gap-3 mb-6 p-2 rounded-2xl bg-white border border-gray-100 shadow-sm",
                        !isSidebarOpen && "justify-center border-none shadow-none bg-transparent p-0"
                    )}>
                        <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-black shrink-0">
                            {user?.firstName?.[0]}
                        </div>
                        {isSidebarOpen && (
                            <div className="truncate">
                                <p className="text-xs font-black text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">Sales Executive</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "flex items-center gap-4 w-full px-5 py-4 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all duration-300 font-black text-sm group",
                            !isSidebarOpen && "justify-center"
                        )}
                    >
                        <LogOut className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                        {isSidebarOpen && <span>Secure Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Nav Top Bar */}
            <div className="md:hidden fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 h-20 flex items-center justify-between px-6">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <Shield className="w-5 h-5" />
                    </div>
                    <span className="font-black text-xl tracking-tighter">Sales<span className="text-primary italic">Hub</span></span>
                </Link>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-xl border-2 border-gray-50">
                            <Menu className="w-6 h-6 text-gray-900" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[85%] p-0 bg-white border-r-0">
                        <div className="p-8 border-b border-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <SheetTitle className="font-black text-2xl tracking-tighter mb-0">Sales<span className="text-primary italic">Hub</span></SheetTitle>
                            </div>
                        </div>
                        <div className="p-6 space-y-2 mt-4">
                            {navItems.map((item) => {
                                const active = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-4 px-6 py-5 rounded-[1.5rem] text-sm font-black transition-all",
                                            active
                                                ? "bg-primary text-white shadow-xl shadow-primary/20"
                                                : "text-gray-500 hover:bg-gray-50"
                                        )}
                                    >
                                        <item.icon size={22} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                        <div className="absolute bottom-8 left-0 w-full px-6">
                            <Button
                                onClick={handleLogout}
                                variant="destructive"
                                className="w-full h-16 rounded-[1.5rem] font-black shadow-xl shadow-rose-200 font-sans"
                            >
                                <LogOut size={20} className="mr-3" /> Sign Out
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Content Area */}
            <main
                className={cn(
                    "flex-1 transition-all duration-500 pt-28 md:pt-0",
                    isSidebarOpen ? "md:ml-[300px]" : "md:ml-[100px]"
                )}
            >
                <div className="p-6 md:p-12 lg:p-20 max-w-7xl mx-auto min-h-screen">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
