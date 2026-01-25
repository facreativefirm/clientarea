"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, ShoppingCart, Server, Zap, Activity, Cpu, HardDrive, Database, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { useLanguage } from "@/components/language-provider";
import { useCartStore, CartItem } from "@/lib/store/cartStore";
import { toast } from "sonner";

interface Product {
    id: number;
    name: string;
    description: string | null;
    monthlyPrice: number;
    annualPrice?: number;
    price?: number;
    pricingModel: string;
    stockQuantity: number | null;
    category?: string;
    productType?: string;
    features?: string | any;
}

interface PricingCardProps {
    product: Product;
    index: number;
}

export function PricingCard({ product, index }: PricingCardProps) {
    const { formatPrice } = useSettingsStore();
    const { language } = useLanguage();
    const router = useRouter();
    const { addItem } = useCartStore();

    let features: string[] = [];

    try {
        if (product.features) {
            // Parse features from JSON string or use directly
            const parsed = typeof product.features === 'string'
                ? JSON.parse(product.features)
                : product.features;

            // Handle the specific format {"list":["1 (up to 4) CPU","2 GB RAM","50 GB SSD","10 TB Traffic"]}
            if (parsed && typeof parsed === 'object') {
                if (parsed.list && Array.isArray(parsed.list)) {
                    features = parsed.list.map((item: any) => String(item).trim());
                } else if (Array.isArray(parsed)) {
                    features = parsed.map(item => String(item).trim());
                } else {
                    // Fallback: extract values from object
                    features = Object.values(parsed)
                        .filter((value): value is string => typeof value === 'string')
                        .map(value => value.trim());
                }
            }
        }
    } catch (e) {
        console.warn("Failed to parse product features", e);
    }

    // Fallback if no features were parsed
    if (features.length === 0 && product.description) {
        features = product.description
            .split('\n')
            .filter((line: string) => line.trim().length > 0)
            .map(line => line.trim());
    }

    // Default features if everything fails
    if (features.length === 0) {
        features = ["1 vCPU cores", "4 GB RAM", "50 GB NVMe disk space", "4 TB bandwidth"];
    }

    const getIconForFeature = (feature: string) => {
        const lower = feature.toLowerCase();
        if (lower.includes('cpu') || lower.includes('core') || lower.includes('vcpu')) return Cpu;
        if (lower.includes('ram') || lower.includes('memory')) return Database;
        if (lower.includes('ssd') || lower.includes('nvme') || lower.includes('disk') || lower.includes('storage')) return HardDrive;
        if (lower.includes('bandwidth') || lower.includes('transfer') || lower.includes('traffic')) return Network;
        if (lower.includes('uptime') || lower.includes('monitoring')) return Activity;
        if (lower.includes('support')) return Server;
        return Zap;
    };

    const handleOrder = () => {
        const item: CartItem = {
            id: product.id.toString(),
            name: product.name,
            type: (product.productType === 'DOMAIN' ? 'DOMAIN' : (['HOSTING', 'VPS', 'RESELLER'].includes(product.productType as string) ? 'HOSTING' : 'OTHER')) as any,
            price: product.monthlyPrice || product.price || 0,
            billingCycle: 'MONTHLY',
            quantity: 1,
            monthlyPrice: product.monthlyPrice,
            annualPrice: product.annualPrice
        };
        addItem(item);
        toast.success(`${product.name} added to cart.`);
        router.push("/checkout");
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ y: -5 }}
            className="group relative flex flex-col p-8 bg-white border-2 border-gray-100 rounded-3xl shadow-lg hover:shadow-2xl hover:border-primary/40 transition-all duration-300"
        >
            <div className="relative z-10 flex flex-col h-full">
                {/* Header */}
                <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
                    {product.description && (
                        <p className="text-gray-600 text-sm line-clamp-2">
                            {product.description}
                        </p>
                    )}
                </div>

                {/* Price */}
                <div className="mb-8">
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm text-gray-400 line-through">
                            {formatPrice(product.monthlyPrice * 2)}
                        </span>
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xl text-gray-600">$</span>
                        <span className="text-5xl font-bold text-gray-900 tracking-tight">
                            {(product.monthlyPrice / 100).toFixed(2).split('.')[0]}
                        </span>
                        <span className="text-2xl font-bold text-gray-900">
                            .{(product.monthlyPrice / 100).toFixed(2).split('.')[1]}
                        </span>
                        <span className="text-gray-500 text-base font-medium">/mo</span>
                    </div>
                    {product.annualPrice && (
                        <p className="text-sm text-gray-500 mt-2">
                            Renews at {formatPrice(product.annualPrice)}/mo for 2 years. Cancel anytime.
                        </p>
                    )}
                </div>

                {/* Action Button */}
                <Button
                    onClick={handleOrder}
                    className="w-full rounded-xl py-6 font-bold text-base mb-8 bg-secondary hover:bg-secondary/90 text-secondary-foreground transition-all duration-200"
                >
                    Choose plan
                </Button>

                {/* Specs List - Updated with better styling */}
                <div className="mt-auto pt-6 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                        Features & Specifications
                    </h4>
                    <ul className="space-y-3">
                        {features.map((feature: string, i: number) => {
                            const Icon = getIconForFeature(feature);
                            return (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <Icon className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <span className="text-sm text-gray-700 font-medium">
                                        {feature}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </motion.div>
    );
}