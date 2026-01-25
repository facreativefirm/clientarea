"use client";

import React from "react";
import { useLanguage } from "@/components/language-provider";
import { Zap, Shield, Headphones, Activity } from "lucide-react";
import { motion } from "framer-motion";

export function FeaturesSection() {
    const { language } = useLanguage();

    const features = [
        {
            icon: Zap,
            title: "Fast BDIX-optimized NVMe",
            description: "BDIX-optimized NVMe SSD storage ensure your website loads instantly for local visitors.",
            color: "text-[#f37021]",
            bg: "bg-[#f37021]/10"
        },
        {
            icon: Shield,
            title: "Ironclad Security",
            description: "Advanced DDoS protection, Imunify360, and automated hourly database backups.",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            icon: Headphones,
            title: "Professional Support",
            description: "Engineers, not just support agents, available 24/7 in Bangla & English.",
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            icon: Activity,
            title: "Transparent Uptime",
            description: "We provide live benchmark reports so you can see our real-world performance.",
            color: "text-purple-500",
            bg: "bg-purple-500/10"
        }
    ];

    return (
        <section className="py-24 bg-gray-50/50" id="features">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
                    <p className="text-lg text-gray-500">We provide the best hosting solutions with enterprise-grade infrastructure.</p>
                </div>

                <motion.div
                    variants={{
                        hidden: { opacity: 0 },
                        show: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.1
                            }
                        }
                    }}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={{
                                hidden: { opacity: 0, scale: 0.95 },
                                show: { opacity: 1, scale: 1 }
                            }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="group bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 transform-gpu"
                        >
                            <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className={`w-7 h-7 ${feature.color}`} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-500 leading-relaxed text-sm">{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
