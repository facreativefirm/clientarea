"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Server, Zap, Shield, Clock, CheckCircle2, Star } from "lucide-react";
import { useStore } from "@/components/store/StoreProvider";
import { getProductDisplayPrice } from "@/lib/productUtils";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useSettingsStore } from "@/lib/store/settingsStore";

export default function StorePage() {
    const { brand, resellerId } = useStore();
    const { formatPrice } = useSettingsStore();
    const [services, setServices] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const host = urlParams.get('host') || window.location.host;
                const sanitizedHost = host.replace(/^https?:\/\//, '').replace(/\/$/, '');

                const [servicesRes, productsRes] = await Promise.all([
                    api.get("/products/services"),
                    api.get(`/products?host=${encodeURIComponent(sanitizedHost)}`)
                ]);

                setServices(servicesRes.data.data.services || []);
                setProducts(productsRes.data.data.products || []);
            } catch (error) {
                console.error("Failed to fetch store data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Group products by service
    const productsByService = services.map(service => {
        const serviceProducts = products.filter(p => p.serviceId === service.id);
        const prices = serviceProducts.map(p => getProductDisplayPrice(p).price);
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

        return {
            ...service,
            products: serviceProducts,
            minPrice: minPrice
        };
    }).filter(s => s.products.length > 0);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                            Welcome to {brand?.name || 'Our Store'}
                        </h1>
                        <p className="text-xl md:text-2xl opacity-90 mb-8 leading-relaxed">
                            Premium hosting solutions tailored for your success. Fast, reliable, and secure.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/store/products">
                                <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg font-semibold rounded-xl shadow-xl border-none">
                                    Browse Products
                                    <ArrowRight className="ml-2" size={20} />
                                </Button>
                            </Link>
                            <Link href="/store/contact">
                                <Button size="lg" variant="outline" className="border-2 border-white bg-white/10 px-8 py-6 text-lg font-semibold rounded-xl">
                                    Contact Sales
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent"></div>
            </section>

            {/* Features */}
            <section className="py-16 bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Zap, title: "Lightning Fast", desc: "NVMe SSD storage for maximum performance" },
                            { icon: Shield, title: "Secure & Safe", desc: "Free SSL certificates and DDoS protection" },
                            { icon: Clock, title: "24/7 Support", desc: "Expert support team always ready to help" },
                            { icon: CheckCircle2, title: "99.9% Uptime", desc: "Guaranteed uptime with SLA backing" }
                        ].map((feature, i) => (
                            <div key={i} className="text-center p-6 rounded-2xl hover:bg-primary/5 transition-all group">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 group-hover:bg-primary flex items-center justify-center text-primary group-hover:text-white transition-all">
                                    <feature.icon size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Products */}
            <section className="py-20 bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Our Hosting Solutions
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Choose from our range of powerful hosting plans designed to meet your needs
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {productsByService.map((service) => (
                                <Link
                                    key={service.id}
                                    href={`/store/products?category=${service.slug}`}
                                    className="group bg-card rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-border hover:border-primary/20"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-primary/10 group-hover:bg-primary flex items-center justify-center text-primary group-hover:text-white transition-all mb-6">
                                        <Server size={28} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                        {service.name}
                                    </h3>
                                    <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                                        {service.description || `Explore our ${service.name} solutions`}
                                    </p>
                                    <div className="flex items-baseline gap-2 mb-6">
                                        <span className="text-sm text-muted-foreground">Starting at</span>
                                        <span className="text-2xl font-bold text-primary">
                                            {formatPrice(service.minPrice)}
                                        </span>
                                        <span className="text-sm text-muted-foreground">/mo</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-border">
                                        <span className="text-sm font-medium text-muted-foreground">
                                            {service.products.length} Plans Available
                                        </span>
                                        <ArrowRight className="text-primary group-hover:translate-x-1 transition-transform" size={20} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-br from-primary to-primary/80 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to Get Started?
                    </h2>
                    <p className="text-xl opacity-90 mb-8">
                        Join thousands of satisfied customers and experience the difference
                    </p>
                    <Link href="/store/products">
                        <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg font-semibold rounded-xl shadow-xl border-none">
                            View All Products
                            <ArrowRight className="ml-2" size={20} />
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
