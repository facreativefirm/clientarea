"use client";

import React from "react";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { useStore } from "./StoreProvider";

export function StoreFooter() {
    const { brand } = useStore();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            {brand?.logoUrl ? (
                                <img src={brand.logoUrl} alt={brand.name} className="h-10 w-auto" />
                            ) : (
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-lg">
                                    {brand?.name?.charAt(0) || 'S'}
                                </div>
                            )}
                            <span className="text-xl font-bold text-white">
                                {brand?.name || 'Store'}
                            </span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Your trusted partner for premium hosting solutions. Fast, reliable, and secure.
                        </p>
                        <div className="flex gap-3">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-blue-600 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                                >
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            {[
                                { name: 'Home', href: '/store' },
                                { name: 'Products', href: '/store/products' },
                                { name: 'About Us', href: '/store/about' },
                                { name: 'Contact', href: '/store/contact' },
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Support</h3>
                        <ul className="space-y-2">
                            {[
                                { name: 'Help Center', href: '/store/help' },
                                { name: 'Terms of Service', href: '/store/terms' },
                                { name: 'Privacy Policy', href: '/store/privacy' },
                                { name: 'Refund Policy', href: '/store/refund' },
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <Mail size={16} className="text-blue-500 mt-1 flex-shrink-0" />
                                <a href="mailto:support@example.com" className="text-sm text-gray-400 hover:text-white transition-colors">
                                    support@example.com
                                </a>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone size={16} className="text-blue-500 mt-1 flex-shrink-0" />
                                <a href="tel:+1234567890" className="text-sm text-gray-400 hover:text-white transition-colors">
                                    +1 (234) 567-890
                                </a>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin size={16} className="text-blue-500 mt-1 flex-shrink-0" />
                                <span className="text-sm text-gray-400">
                                    123 Business St, Suite 100<br />
                                    City, State 12345
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500 text-center md:text-left">
                        © {currentYear} {brand?.name || 'Store'}. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <img src="/images/payment-methods.png" alt="Payment Methods" className="h-6 opacity-70" onError={(e) => e.currentTarget.style.display = 'none'} />
                    </div>
                </div>
            </div>
        </footer>
    );
}
