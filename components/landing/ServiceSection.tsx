"use client";

import React from "react";
import { motion } from "framer-motion";
import { PricingCard } from "./PricingCard";

interface ServiceSectionProps {
    title: string;
    description?: string;
    products: any[];
    index: number;
}

export function ServiceSection({ title, description, products, index }: ServiceSectionProps) {
    if (products.length === 0) return null;

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Alternate background for odd/even sections */}
            <div className={`absolute inset-0 pointer-events-none ${index % 2 === 0 ? 'bg-background' : 'bg-primary/5'}`} />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 mb-4 inline-block">
                        {title}
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        {description || `Choose the perfect ${title} plan for your needs.`}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product, i) => (
                        <PricingCard key={product.id} product={product} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}
