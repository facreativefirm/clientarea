"use client";

import React from "react";
import Image from "next/image";
import { Check, X, Server, Shield, Zap, Clock, MousePointerClick, MessageSquare } from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";

export function ComparisonSection() {
    const comparisons = [
        {
            feature: "Package below 1500 Tk",
            us: true,
            bluehost: false,
            digitalOcean: false,
        },
        {
            feature: "Websites",
            us: "Unlimited",
            bluehost: "Limited",
            digitalOcean: "Limited",
            highlight: "20x faster"
        },
        {
            feature: "NVMe SSD Storage",
            us: true,
            bluehost: false,
            digitalOcean: false,
        },
        {
            feature: "CPU/RAM allocation disclosed",
            us: true,
            bluehost: false,
            digitalOcean: false,
        },
        {
            feature: "Direct Technical Assistance",
            us: true,
            bluehost: false,
            digitalOcean: false,
        },
        {
            feature: "Physical support",
            us: true,
            bluehost: false,
            digitalOcean: false,
        },
        {
            feature: "DDoS protection",
            us: true,
            bluehost: false,
            digitalOcean: false,
        },
        {
            feature: "Hardware Verification Transparency",
            us: true,
            bluehost: false,
            digitalOcean: false,
        },
        {
            feature: "Automated daily Backups",
            us: true,
            bluehost: true,
            digitalOcean: true,
        },
        {
            feature: "Free One-Click Restores",
            us: true,
            bluehost: false,
            digitalOcean: false,
        },
        {
            feature: "Hourly Database Backup",
            us: true,
            bluehost: false,
            digitalOcean: false,
            tag: "Exclusive"
        },
        {
            feature: "Hidden Renewal Price Hikes",
            us: false,
            bluehost: true,
            digitalOcean: true,
            inverse: true
        },
        {
            feature: "Elite 24/7 Human Support",
            us: true,
            bluehost: true,
            digitalOcean: true,
            tag: "Standard"
        },
        {
            feature: "Solution in Live Chat",
            us: "Guaranteed",
            bluehost: "Limited",
            digitalOcean: "Self-Serve",
        },
        {
            feature: "Make transfer out difficult",
            us: false,
            bluehost: true,
            digitalOcean: true,
            inverse: true
        },
    ];

    const renderValue = (value: boolean | string, isInverse: boolean = false) => {
        if (typeof value === "string") {
            return <span className="text-sm font-medium">{value}</span>;
        }

        // Good cases: True (normal) OR False (inverse/negative trait like 'Price increases')
        const isGood = isInverse ? !value : value;

        if (isGood) {
            return <Check className="w-5 h-5 text-emerald-500 mx-auto" />;
        }
        return <X className="w-5 h-5 text-[#004ea3] mx-auto" />;
    };

    return (
        <section className="py-24 bg-gradient-to-b from-white to-sky-50/50">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                        Huge SSD Space Like Other International Hosting Provider
                    </h2>
                    <p className="text-slate-500 max-w-2xl mx-auto">
                        See how we stack up against the competition. We believe in transparency and providing better value for your money.
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 relative">
                    {/* Floating Badge */}
                    <div className="absolute top-0 right-0 bg-[#f37021] text-white text-[10px] uppercase font-bold px-4 py-1 rounded-bl-xl z-20">
                        Compare With competitors
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-center">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="p-6 text-left w-1/3 min-w-[200px]"></th>
                                    <th className="p-6 text-primary font-bold text-lg min-w-[150px] bg-primary/5">
                                        FA Creative Firm
                                    </th>
                                    <th className="p-6 text-slate-600 font-bold text-lg min-w-[150px]">
                                        DigitalOcean
                                    </th>
                                    <th className="p-6 text-slate-600 font-bold text-lg min-w-[150px]">
                                        Bluehost
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {comparisons.map((row, idx) => (
                                    <tr
                                        key={idx}
                                        className="hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <td className="p-4 pl-8 text-left text-slate-600 font-medium relative">
                                            {row.feature}
                                            {row.highlight && (
                                                <span className="absolute top-1 right-2 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                                                    {row.highlight}
                                                </span>
                                            )}
                                            {row.tag && (
                                                <span className={`
                                                    ml-2 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide inline-block
                                                    ${row.tag === 'Exclusive' ? 'bg-rose-100 text-[#004ea3]' : 'bg-slate-100 text-slate-500'}
                                                `}>
                                                    {row.tag}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 bg-primary/5 font-semibold text-slate-700">
                                            {renderValue(row.us, row.inverse)}
                                        </td>
                                        <td className="p-4 text-slate-500">
                                            {renderValue(row.digitalOcean, row.inverse)}
                                        </td>
                                        <td className="p-4 text-slate-500">
                                            {renderValue(row.bluehost, row.inverse)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function SSDShowcaseSection() {
    const containerRef = React.useRef(null);
    const isInView = useInView(containerRef, { once: true, amount: 0.3 });

    return (
        <section className="py-24 bg-white overflow-hidden" ref={containerRef}>
            <div className="container mx-auto px-4 max-w-5xl text-center">
                <div className="mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
                        Engineered for High-Velocity Business
                    </h2>
                    <p>
                        If storage devices were cars, the time it takes a
                        <span className="text-slate-700 font-semibold"> 15K HDD</span> to travel from
                        <strong> Kawran Bazar to Farmgate (100m)</strong>, a standard
                        <span className="text-slate-700 font-semibold"> NAND Flash SSD</span> would have already reached
                        <strong> Gazipur from Dhaka (26km)</strong>.
                    </p>
                </div>

                <div className="relative flex justify-center items-center py-10 scale-90 md:scale-100 min-h-[400px]">
                    <AnimatePresence>
                        {isInView && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            >
                                <Image
                                    src="/ssd-disk.svg"
                                    alt="SSD Comparison Architecture"
                                    width={1000}
                                    height={500}
                                    className="drop-shadow-sm transition-all hover:drop-shadow-xl"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-left w-full">
                    <div className="space-y-3">
                        <h4 className="text-[#f37021] font-bold text-[20px] uppercase tracking-widest">
                            Optimized TTFB Performance
                        </h4>
                        <p className="text-[14px] text-slate-500 leading-relaxed">
                            Time to First Byte is a critical metric for Core Web Vitals. Our fine-tuned server stack ensures near-instant response times, giving you a distinct advantage in search rankings.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-[#f37021] font-bold text-[20px] uppercase tracking-widest">
                            99.9% Efficiency Rating
                        </h4>
                        <p className="text-[14px] text-slate-500 leading-relaxed">
                            By utilizing 100% NVMe storage paired with top-tier CPU allocations, we deliver performance that outclasses standard cloud environments by a factor of five.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-[#f37021] font-bold text-[20px] uppercase tracking-widest">
                            Pristine IP Reputation
                        </h4>
                        <p className="text-[14px] text-slate-500 leading-relaxed">
                            We maintain strict control over our IP blocks to ensure your communications never hit a blacklist. Our proactive health monitoring guarantees high deliverability for your business.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Export a wrapper to keep page.tsx clean
export function PerformanceSections() {
    return (
        <div className="bg-white">
            <ComparisonSection />
            <SSDShowcaseSection />
        </div>
    );
}
