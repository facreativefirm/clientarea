"use client";

import React from "react";
import Link from "next/link";
import { ShoppingCart, Search, Menu, X, User, ChevronDown } from "lucide-react";
import { useStore } from "./StoreProvider";
import { useCartStore } from "@/lib/store/cartStore";
import { Button } from "@/components/ui/button";

export function StoreNavbar() {
    const { brand } = useStore();
    const { items } = useCartStore();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [searchOpen, setSearchOpen] = React.useState(false);

    const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/store" className="flex items-center gap-3 group">
                        {brand?.logoUrl ? (
                            <img src={brand.logoUrl} alt={brand.name} className="h-10 w-auto" />
                        ) : (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {brand?.name?.charAt(0) || 'S'}
                            </div>
                        )}
                        <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                            {brand?.name || 'Store'}
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/store" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            Home
                        </Link>
                        <Link href="/store/products" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            Products
                        </Link>
                        <Link href="/store/about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            About
                        </Link>
                        <Link href="/store/contact" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            Contact
                        </Link>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <button
                            onClick={() => setSearchOpen(!searchOpen)}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                        >
                            <Search size={20} />
                        </button>

                        {/* Cart */}
                        <Link
                            href="/store/cart"
                            className="relative p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                        >
                            <ShoppingCart size={20} />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                                    {cartItemCount}
                                </span>
                            )}
                        </Link>

                        {/* Account */}
                        <Link
                            href="/auth/login"
                            className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors shadow-sm"
                        >
                            <User size={16} />
                            Account
                        </Link>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Search Bar (Expandable) */}
                {searchOpen && (
                    <div className="py-4 border-t border-border mt-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full pl-10 pr-4 py-3 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                autoFocus
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-border bg-background shadow-xl">
                    <div className="px-4 py-4 space-y-2">
                        {[
                            { name: 'Home', href: '/store' },
                            { name: 'Products', href: '/store/products' },
                            { name: 'About Us', href: '/store/about' },
                            { name: 'Contact', href: '/store/contact' },
                        ].map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Link
                            href="/auth/login"
                            className="block px-4 py-3 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-all text-center mt-4"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Login / Register
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
