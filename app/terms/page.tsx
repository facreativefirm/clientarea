"use client";

import React from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/landing/Footer";
import { useLanguage } from "@/components/language-provider";
import { motion } from "framer-motion";

export default function TermsPage() {
    const { language } = useLanguage();

    const sections = [
        {
            title: "1. Service Agreement",
            content: "By activating any service with us, you enter into a binding agreement. We provide high-performance infrastructure optimized for connectivity in Bangladesh, subject to the Fair Usage Policies defined below."
        },
        {
            title: "2. Acceptable Use Policy (AUP)",
            content: "Users are strictly prohibited from hosting content that violates Bangladeshi law. This includes, but is not limited to, copyrighted material without permission, malicious software, and activities that disrupt the BDIX network stability."
        },
        {
            title: "3. Resource Allocation & Fair Use",
            content: "To maintain 100% stability for all nodes, we implement CloudLinux resource limits. Excessive CPU or I/O usage that impacts other users may result in temporary suspension or automated throttling of the service."
        },
        {
            title: "4. BDIX Connectivity & SLA",
            content: "Our 99.9% Uptime SLA covers the availability of the server and core network. While we maintain direct peering with all major Bangladeshi ISPs, we are not responsible for routing issues within local ISP networks themselves."
        },
        {
            title: "5. Financial Compliance & Billing",
            content: "All services are prepaid. Domain registration fees are non-refundable once the request is submitted to the registry (BTCL or global registrars). We reserve the right to adjust pricing with 30-day prior notice."
        },
        {
            title: "6. Managed Support Scope",
            content: "Our 'Professional Support' covers infrastructure, network, and control panel issues. While we provide best-effort assistance for third-party scripts, comprehensive application-level debugging is outside our standard scope."
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
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 border-b-4 border-[#f37021] inline-block">Terms of Service</h1>
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
