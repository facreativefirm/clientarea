"use client";

import React from "react";
import { useLanguage } from "@/components/language-provider";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

export function TestimonialsSection() {
    const { t } = useLanguage();

    const testimonials = [
        {
            content: t("testimonial_1"),
            author: "Sarah Johnson",
            role: "Full Stack Developer",
            avatar: "SJ"
        },
        {
            content: t("testimonial_2"),
            author: "Michael Chen",
            role: "Startup Founder",
            avatar: "MC"
        },
        {
            content: "Reliability is key for our business, and WHMCS CRM delivers 100%.",
            author: "Alex Rivera",
            role: "CTO, TechCorp",
            avatar: "AR"
        }
    ];

    return (
        <section className="py-24 bg-white border-t border-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t("testimonials")}</h2>
                    <p className="text-lg text-gray-500">{t("trusted_by")}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="bg-gray-50 p-8 rounded-3xl relative"
                        >
                            <Quote className="w-10 h-10 text-primary/10 absolute top-6 right-6" />
                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                                ))}
                            </div>
                            <p className="text-gray-700 text-lg mb-8 italic">"{item.content}"</p>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[#f37021]/10 flex items-center justify-center text-[#f37021] font-bold text-sm">
                                    {item.avatar}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{item.author}</p>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">{item.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
