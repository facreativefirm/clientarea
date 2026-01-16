"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Globe, Server, Zap } from "lucide-react";

export function NetworkMap() {
    const locations = [
        { name: "USA", city: "New York & Dallas", top: "42%", left: "22%" },
        { name: "Europe", city: "London & Frankfurt", top: "35%", left: "48%" },
        { name: "Asia", city: "Singapore", top: "65%", left: "78%" },
    ];

    return (
        <section className="py-24 bg-[#0B1120] overflow-hidden relative" id="network">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#f37021] rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[150px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f37021]/10 border border-[#f37021]/20 text-[#f37021] text-xs font-black uppercase tracking-widest mb-6"
                    >
                        <Globe size={14} className="animate-spin-slow" />
                        Global Infrastructure
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight"
                    >
                        Our Datacenters are Located in <span className="text-[#f37021]">3 Regions</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 max-w-2xl mx-auto text-lg"
                    >
                        Experience ultra-low latency and peak performance with our enterprise-grade infrastructure strategically deployed across the globe.
                    </motion.p>
                </div>

                <div className="relative aspect-[16/9] md:aspect-[21/9] w-full max-w-5xl mx-auto">
                    {/* The Map SVG */}
                    <motion.img
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        src="/area.svg"
                        alt="Global Network Map"
                        className="w-full h-full object-contain filter brightness-125 saturate-50 opacity-40"
                    />

                    {/* Interactive Spots */}
                    {locations.map((loc, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 + i * 0.2, type: "spring", stiffness: 100 }}
                            className="absolute z-20 group"
                            style={{ top: loc.top, left: loc.left }}
                        >
                            <div className="relative">
                                {/* Ping Animation */}
                                <span className="absolute inset-0 rounded-full bg-[#f37021] opacity-75 animate-ping" />

                                {/* The Dot */}
                                <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-[#f37021] border-2 border-white shadow-[0_0_20px_rgba(243,112,33,0.8)] relative z-10 cursor-pointer transition-transform group-hover:scale-125" />

                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none translate-y-2 group-hover:translate-y-0 w-max">
                                    <div className="bg-white rounded-xl p-3 shadow-2xl border border-gray-100 text-left">
                                        <p className="text-[#f37021] text-[10px] font-black uppercase tracking-widest mb-1">{loc.name}</p>
                                        <p className="text-gray-900 font-bold text-sm">{loc.city}</p>
                                        <div className="flex items-center gap-3 mt-2 text-[9px] font-bold text-gray-500 uppercase">
                                            <span className="flex items-center gap-1"><Zap size={10} className="text-amber-500" /> &lt; 20ms</span>
                                            <span className="flex items-center gap-1"><Server size={10} className="text-blue-500" /> N+1 Redundancy</span>
                                        </div>
                                    </div>
                                    {/* Tooltip Arrow */}
                                    <div className="w-3 h-3 bg-white rotate-45 mx-auto -mt-1.5 border-r border-b border-gray-100" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 border-t border-white/5 pt-12">
                    {[
                        { label: "Global Presence", val: "3 Regions", icon: Globe },
                        { label: "Network Uptime", val: "99.99%", icon: Zap },
                        { label: "Low Latency", val: "< 30ms Avg", icon: Activity },
                        { label: "DDoS Protection", val: "Enterprise", icon: ShieldCheck }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 * i }}
                            className="text-center md:text-left"
                        >
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-white/5 text-[#f37021]">
                                    <stat.icon size={18} />
                                </div>
                                <span className="text-white font-black text-xl">{stat.val}</span>
                            </div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest pl-1">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

import { Activity, ShieldCheck } from "lucide-react";
