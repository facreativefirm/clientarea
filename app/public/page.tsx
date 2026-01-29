"use client";

import React, { useState, useEffect } from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ServiceGroupList } from "@/components/landing/ServiceGroupList";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { PerformanceSections } from "@/components/landing/PerformanceSections";
import { NetworkMap } from "@/components/landing/NetworkMap";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { Footer } from "@/components/landing/Footer";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Snappy initial load
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-primary/10 selection:text-primary">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-[100] bg-white flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-4 border-t-primary"
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            <PublicNavbar />
            <main>
              <HeroSection />
              <ServiceGroupList />
              <FeaturesSection />
              <PerformanceSections />
              <NetworkMap />
              <TestimonialsSection />
              <FAQSection />
            </main>
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
