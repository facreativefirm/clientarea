"use client";

import React from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/landing/Footer";
import { useLanguage } from "@/components/language-provider";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
    const { t } = useLanguage();

    const contactMethods = [
        {
            icon: Mail,
            title: "Email Support",
            desc: "Response within 2 hours",
            value: "support@whmcscrm.com",
            bg: "bg-blue-500/10",
            color: "text-blue-500"
        },
        {
            icon: Phone,
            title: "Phone Support",
            desc: "Mon-Fri (9am - 6pm)",
            value: "+1 (555) 123-4567",
            bg: "bg-emerald-500/10",
            color: "text-emerald-500"
        },
        {
            icon: MapPin,
            title: "Office Location",
            desc: "Global Headquarters",
            value: "123 Tech Avenue, Silicon Valley",
            bg: "bg-[#f37021]/10",
            color: "text-[#f37021]"
        }
    ];

    return (
        <div className="min-h-screen bg-white font-sans">
            <PublicNavbar />

            <main className="pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Header */}
                    <div className="text-center mb-20">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6"
                        >
                            {t("get_in_touch")}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-gray-500 max-w-2xl mx-auto"
                        >
                            {t("contact_desc")}
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-2 bg-white border border-gray-100 p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-gray-200/50"
                        >
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">{t("your_name")}</label>
                                        <Input placeholder="John Doe" className="rounded-2xl h-14 bg-gray-50 border-transparent focus:bg-white focus:ring-primary/20 transition-all border-gray-100" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">{t("your_email")}</label>
                                        <Input type="email" placeholder="john@example.com" className="rounded-2xl h-14 bg-gray-50 border-transparent focus:bg-white focus:ring-primary/20 transition-all border-gray-100" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">{t("subject")}</label>
                                    <Input placeholder="How can we help?" className="rounded-2xl h-14 bg-gray-50 border-transparent focus:bg-white focus:ring-primary/20 transition-all border-gray-100" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">{t("message")}</label>
                                    <Textarea placeholder="Tell us more about your request..." className="rounded-2xl min-h-[160px] bg-gray-50 border-transparent focus:bg-white focus:ring-primary/20 transition-all border-gray-100" />
                                </div>
                                <Button className="w-full md:w-auto px-10 h-14 rounded-2xl font-bold bg-[#f37021] hover:bg-[#d9621c] text-white shadow-lg shadow-[#f37021]/20 hover:scale-[1.02] active:scale-100 transition-all">
                                    <Send className="w-4 h-4 mr-2" />
                                    {t("send_message")}
                                </Button>
                            </form>
                        </motion.div>

                        {/* Contact Info */}
                        <div className="space-y-8">
                            {contactMethods.map((method, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-gray-50/50 border border-gray-100 p-8 rounded-[2rem] hover:bg-white hover:shadow-lg transition-all duration-300 group"
                                >
                                    <div className={`w-12 h-12 rounded-2xl ${method.bg} ${method.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                        <method.icon size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{method.title}</h3>
                                    <p className="text-sm text-gray-500 mb-4">{method.desc}</p>
                                    <p className="font-bold text-[#f37021] break-all">{method.value}</p>
                                </motion.div>
                            ))}

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-primary p-8 rounded-[2rem] text-white flex items-center justify-between"
                            >
                                <div>
                                    <p className="font-bold text-lg mb-1">Live Chat Available</p>
                                    <p className="text-primary-foreground/80 text-sm">Talk to us in real-time</p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                    <MessageCircle size={24} />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
