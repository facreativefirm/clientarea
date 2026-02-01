"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Shield, Book, RefreshCcw } from "lucide-react";

interface PolicyPageProps {
    title: string;
    description: string;
    icon: React.ElementType;
    contentEn: string;
    contentBn: string;
}

export function PolicyPage({ title, description, icon: Icon, contentEn, contentBn }: PolicyPageProps) {
    return (
        <div className="min-h-screen bg-white text-foreground transition-colors duration-300">
            <Navbar />
            <div className="flex justify-center pt-24 p-6 md:p-12">
                <div className="w-full max-w-7xl space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-primary/10 text-primary border border-primary/20 shadow-xl shadow-primary/5">
                            <Icon size={40} />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                {title}
                            </h1>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                {description}
                            </p>
                        </div>
                    </div>

                    {/* Content Container - Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* English Content */}
                        <div className="glass rounded-[2.5rem] p-8 md:p-10 border border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-xl bg-white/5 flex flex-col">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                            <div className="mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-primary/20 text-primary">English</span>
                                <h3 className="font-bold text-lg">Terms & Details</h3>
                            </div>
                            <div className="prose prose-invert max-w-none prose-headings:text-primary prose-strong:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-p:leading-relaxed">
                                {contentEn.split('\n').map((line, i) => (
                                    <p key={i} className={line.trim() === '' ? 'h-4' : 'mb-4'}>
                                        {line}
                                    </p>
                                ))}
                            </div>
                        </div>

                        {/* Bengali Content */}
                        <div className="glass rounded-[2.5rem] p-8 md:p-10 border border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-xl bg-white/5 flex flex-col">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent"></div>
                            <div className="mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-primary/20 text-primary font-tiro-bangla">বাংলা</span>
                                <h3 className="font-bold text-lg font-tiro-bangla">বিবরণ ও শর্তাবলী</h3>
                            </div>
                            <div className="prose prose-invert max-w-none prose-headings:text-primary prose-strong:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground font-tiro-bangla prose-p:leading-relaxed text-lg">
                                {contentBn.split('\n').map((line, i) => (
                                    <p key={i} className={line.trim() === '' ? 'h-4' : 'mb-4'}>
                                        {line}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer / Contact Information */}
                    <div className="text-center py-8 border-t border-white/5 mt-12">
                        <p className="text-sm text-muted-foreground">
                            Last Updated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
