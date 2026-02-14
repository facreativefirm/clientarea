"use client";

import React from "react";
import Link from "next/link";
import { Shield, Facebook, Twitter, Instagram, Linkedin, Heart } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useSettingsStore } from "@/lib/store/settingsStore";

export function Footer() {
    const { language } = useLanguage();
    const { settings } = useSettingsStore();

    return (
        <footer className="relative border-t border-gray-100 bg-white pt-20 pb-10 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <img
                                src="/Facreativefirmltd.png"
                                alt="Logo"
                                className="w-10 h-10 object-contain"
                            />
                            <span className="text-xl font-bold text-gray-900">
                                {settings.appName || 'FA CRM'}
                            </span>
                        </div>
                        <p className="text-gray-500 leading-relaxed text-sm">
                            BDIX-Optimized NVMe SSD Hosting for ultimate speed. Professional support is our impression.
                        </p>
                        <div className="flex gap-4">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <Link key={i} href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all duration-300">
                                    <Icon size={16} />
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 text-lg mb-6">Services</h4>
                        <ul className="space-y-3 text-sm">
                            {[
                                { name: "Hosting", href: "/public/#hosting" },
                                { name: "Domains", href: "/client/domains" },
                                { name: "VPS Servers", href: "/public/#hosting" },
                                { name: "SSL Certificates", href: "/public/#services" },
                                { name: "Reseller Program", href: "/reseller" }
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="text-gray-500 hover:text-primary transition-colors flex items-center gap-2 group">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-primary transition-colors" />
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 text-lg mb-6">Support</h4>
                        <ul className="space-y-3 text-sm">
                            {[
                                { name: "About Us", href: "/public/about" },
                                { name: "Contact Us", href: "/public/contact" },
                                { name: "Privacy Policy", href: "/public/privacy" },
                                { name: "Terms of Service", href: "/public/terms" },
                                { name: "FAQ", href: "/public/#faq" }
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="text-gray-500 hover:text-primary transition-colors flex items-center gap-2 group">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-primary transition-colors" />
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 text-lg mb-6">Newsletter</h4>
                        <p className="text-gray-500 text-sm mb-4">Get the latest updates and offers.</p>
                        <form className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Your Email"
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 w-full text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                            />
                            <button className="bg-secondary text-white rounded-xl px-4 font-bold hover:bg-secondary/90 transition-colors shadow-lg shadow-secondary/20">
                                Go
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-400 text-center md:text-left">
                        &copy; {new Date().getFullYear()} {settings.appName || 'FA CRM'}. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
