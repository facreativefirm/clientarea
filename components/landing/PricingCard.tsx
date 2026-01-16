"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, ShoppingCart, Server, Zap } from "lucide-react";
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
}

interface PricingCardProps {
    product: Product;
    index: number;
}

export function PricingCard({ product, index }: PricingCardProps) {
    const { formatPrice } = useSettingsStore();
    const { t } = useLanguage();
    const router = useRouter();
    const { addItem } = useCartStore();

    const features = product.description
        ? product.description.split('\n').filter((line: string) => line.trim().length > 0)
        : ["24/7 Support", "Free Migration", "99.9% Uptime"];

    const handleOrder = () => {
        const item: CartItem = {
            id: product.id.toString(),
            name: product.name,
            type: (product.category || product.productType || 'HOSTING') as any,
            price: product.monthlyPrice || product.price || 0,
            billingCycle: 'MONTHLY',
            quantity: 1,
            monthlyPrice: product.monthlyPrice,
            annualPrice: product.annualPrice
        };
        addItem(item);
        toast.success(`${product.name} ${t("added_to_cart")}`);
        router.push("/checkout");
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ y: -5 }}
            className="group relative flex flex-col p-8 bg-white border border-gray-100 rounded-3xl shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300"
        >
            <div className="relative z-10 flex flex-col h-full">
                {/* Header */}
                <Link href={`/products/${product.id}`} className="mb-6 block hover:text-primary transition-colors">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-gray-500 text-sm">{t("starter_journey")}</p>
                </Link>

                {/* Price */}
                <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
                            {formatPrice(product.monthlyPrice)}
                        </span>
                        <span className="text-gray-500 text-sm font-medium">{t("mo")}</span>
                    </div>
                </div>

                {/* Action */}
                <div className="flex flex-col gap-3 mb-8">
                    <Button
                        onClick={handleOrder}
                        className="w-full rounded-xl py-6 font-bold text-base shadow-lg shadow-[#f37021]/20 hover:shadow-[#f37021]/30 bg-[#f37021] hover:bg-[#d9621c] text-white transition-all duration-200"
                    >
                        <ShoppingCart className="mr-2 w-4 h-4" />
                        {t("order_now")}
                    </Button>
                    <Link
                        href={`/products/${product.id}`}
                        className="w-full text-center text-xs font-bold text-gray-400 hover:text-primary uppercase tracking-widest transition-colors"
                    >
                        View Full Specs
                    </Link>
                </div>

                {/* Features */}
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{
                        hidden: { opacity: 0 },
                        show: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.05,
                                delayChildren: 0.1
                            }
                        }
                    }}
                    className="flex-1 space-y-3 pt-6 border-t border-gray-100"
                >
                    {features.slice(0, 5).map((feature: string, i: number) => (
                        <motion.div
                            key={i}
                            variants={{
                                hidden: { opacity: 0, x: -10 },
                                show: { opacity: 1, x: 0 }
                            }}
                            className="flex items-start gap-3 text-sm text-gray-600"
                        >
                            <div className="mt-0.5 rounded-full bg-emerald-50 text-emerald-600 p-0.5">
                                <Check size={14} strokeWidth={3} />
                            </div>
                            <span>{feature}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </motion.div>
    );
}
