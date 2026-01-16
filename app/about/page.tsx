"use client";

import React from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/landing/Footer";
import { NetworkMap } from "@/components/landing/NetworkMap";
import { useLanguage } from "@/components/language-provider";
import { motion } from "framer-motion";
import { Users, Target, Rocket, Shield, Server, Zap, Globe, Check } from "lucide-react";

export default function AboutPage() {
    const { t } = useLanguage();

    const stats = [
        { label: "Active Clients", value: "10k+", icon: Users },
        { label: "Global Servers", value: "50+", icon: Target },
        { label: "Uptime SLA", value: "99.9%", icon: Shield },
        { label: "Years Experience", value: "12+", icon: Rocket },
    ];

    return (
        <div className="min-h-screen bg-white">
            <PublicNavbar />

            <main className="pt-32 pb-20">
                <div className="max-w-7xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center mb-24">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6"
                        >
                            <Shield size={16} />
                            Trusted by 5,000+ Active Nodes
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl font-black text-gray-900 mb-8 tracking-tight"
                        >
                            We Power the <span className="text-[#f37021] italic">Digital Frontier</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-gray-500 max-w-4xl mx-auto leading-relaxed"
                        >
                            Since our inception, we've focused on one thing: Providing the most stable, BDIX-optimized hosting infrastructure in South Asia. Our reputation is built on retention, not just acquisition.
                        </motion.p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-32 px-6">
                        {[
                            { label: "Deployment Nodes", value: "5,200+", icon: Server, detail: "Active Services" },
                            { label: "Response SLA", value: "15 Min", icon: Target, detail: "Average Reply" },
                            { label: "Local Latency", value: "< 5ms", icon: Zap, detail: "BDIX Network" },
                            { label: "Global Reach", icon: Globe, value: "125+", detail: "Countries Served" },
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative group"
                            >
                                <div className="absolute inset-0 bg-primary/5 rounded-[2rem] blur-xl group-hover:bg-primary/10 transition-colors" />
                                <div className="relative bg-white border border-gray-100 p-8 rounded-[2rem] text-center shadow-sm">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-primary mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                        <stat.icon size={28} />
                                    </div>
                                    <div className="text-4xl font-black text-gray-900 mb-1">{stat.value}</div>
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</div>
                                    <div className="text-[10px] font-medium text-primary uppercase">{stat.detail}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Core Values */}
                    <div className="mb-32 px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
                            <div className="w-20 h-1.5 bg-[#f37021] mx-auto rounded-full" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {[
                                {
                                    title: "Professional Impression",
                                    desc: "We don't just solve tickets; we provide architectural guidance. Our support isn't an 'impression' of help—it's genuine engineering.",
                                    icon: Users
                                },
                                {
                                    title: "Retention Logic",
                                    desc: "Our business model is built on keeping you happy for years. We prioritize stability over growth-hacking every single day.",
                                    icon: Shield
                                },
                                {
                                    title: "Verified Performance",
                                    desc: "We lead with data. Check our live benchmark reports anytime to see the real-world performance of our NVMe SSD clusters.",
                                    icon: Rocket
                                }
                            ].map((value, i) => (
                                <div key={i} className="space-y-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                        <value.icon size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">{value.title}</h3>
                                    <p className="text-gray-500 leading-relaxed text-sm">{value.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tech Stack */}
                    <div className="bg-gray-900 rounded-[3rem] p-12 md:p-20 text-white mb-32 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                            <div>
                                <h2 className="text-4xl font-black mb-8 leading-tight">The Stack That <br />Drives Your Success</h2>
                                <div className="space-y-6">
                                    {[
                                        { title: "LiteSpeed Web Server", detail: "600% faster than Apache for WordPress." },
                                        { title: "CloudLinux OS", detail: "Isolated resources for maximum stability & security." },
                                        { title: "NVMe SSD Clusters", detail: "Enterprise-grade storage with 10Gbps connectivity." },
                                        { title: "Imunify360 Protection", detail: "AI-powered security that stops attacks before they hit." }
                                    ].map((tech, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg">{tech.title}</h4>
                                                <p className="text-gray-400 text-sm">{tech.detail}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-500">
                                        <Shield size={20} />
                                    </div>
                                    Zero-Trust Security
                                </h3>
                                <p className="text-gray-400 mb-8 text-sm">
                                    Every node in our infrastructure undergoes rigorous security audits. We implement KernelCare for rebootless updates and hourly database snapshots for complete peace of mind.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="text-primary font-bold text-xl">Hourly</div>
                                        <div className="text-[10px] uppercase font-bold text-gray-500">Backups</div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="text-primary font-bold text-xl">10 Gbps</div>
                                        <div className="text-[10px] uppercase font-bold text-gray-500">Uplink</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <NetworkMap />


                    {/* Infrastructure Section */}
                    <div className="grid grid-cols-1 px-6 mt-10 md:grid-cols-2 gap-20 items-center">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-primary/5 rounded-[2.5rem] rotate-3"></div>
                            <div className="relative aspect-[4/3] bg-gray-100 rounded-[2rem] overflow-hidden shadow-2xl border border-gray-200 flex items-center justify-center">
                                <img src="/hero_section.svg" className="w-[80%] opacity-40 scale-125 hover:rotate-2 transition-transform duration-700" alt="About Illustration" />
                                <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
                                <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/50">
                                    <div className="flex items-center gap-2 text-[#f37021] font-black uppercase text-[10px] tracking-widest mb-2">
                                        <div className="w-2 h-2 rounded-full bg-[#f37021] animate-pulse" />
                                        Data Center Monitor
                                    </div>
                                    <div className="text-sm font-bold text-gray-900">Dhaka, Bangladesh Node is 100% Operational</div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-4xl font-extrabold text-gray-900 mb-8 leading-tight">Bangladesh's Most <br /><span className="text-[#f37021] underline decoration-[#f37021]/20 underline-offset-8">Resilient Network</span></h2>
                            <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                We operate multiple points of presence (PoP) in Dhaka to ensure the lowest possible latency for our local users. Our BDIX connectivity is peered with all major IIGs and ISPs in the country.
                            </p>
                            <div className="space-y-4">
                                {[
                                    "Connected to national BDIX exchanges",
                                    "Direct peering with local ISP networks",
                                    "Multiple power backups & redundant cooling",
                                    "Professional engineers on-site 24/7"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 text-gray-700 font-semibold">
                                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
