"use client";

import React from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/landing/Footer";
import { useLanguage } from "@/components/language-provider";
import { motion } from "framer-motion";

export default function PrivacyPage() {
    const { language } = useLanguage();

    const sections = [
        {
            title: "1. Scope and Consent",
            content: "This Privacy Policy describes how we collect, use, and share your personal information when you use our infrastructure services. By using our platform, you consent to the data practices described in this statement."
        },
        {
            title: "2. Information We Collect",
            content: "We collect information you provide directly to us (name, email, financial details) and automated technical data including IP addresses, browser types, and access times to ensure platform security and optimize BDIX routing."
        },
        {
            title: "3. Professional Support & Data Access",
            content: "Our Support Engineers may access your service metadata to provide technical assistance. We implement strict 'Least Privilege' access controls and log all administrative actions."
        },
        {
            title: "4. Infrastructure & Data Residency",
            content: "While our core operations are in Bangladesh, we utilize global CDN and DNS infrastructure. Your data may be processed in various geographic locations to ensure maximum availability and lowest latency."
        },
        {
            title: "5. Information Security",
            content: "We implement enterprise-grade security including 256-bit encryption, hardware firewalls, and regular penetration testing. We never sell your personal data to third parties."
        },
        {
            title: "6. Data Retention",
            content: "We retain your personal information for as long as necessary to provide services and comply with legal obligations. Financial records are retained for architectural and tax compliance as required by law."
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            <PublicNavbar />

            <main className="pt-32 pb-20">
                <div className="max-w-4xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 border-b-4 border-[#f37021] inline-block">Privacy Policy</h1>
                        <p className="text-gray-500 uppercase tracking-widest text-sm font-bold">
                            Last Updated: January 15, 2026
                        </p>
                    </motion.div>

                    <div className="prose prose-gray max-w-none space-y-12">
                        {sections.map((section, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    {section.content}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
