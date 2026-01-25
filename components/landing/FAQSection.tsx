"use client";

import React from "react";
import { useLanguage } from "@/components/language-provider";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

export function FAQSection() {
    const { language } = useLanguage();

    const questions = [
        { q: "How long does it take to activate?", a: "Most services are activated instantly after payment confirmation." },
        { q: "How long does .BD domain activation take?", a: "Normally it takes 3 to 4 working days to activate a .bd domain from BTCL." },
        { q: "Can I upgrade my plan later?", a: "Yes, you can upgrade or downgrade your plan at any time from the client area." },
        { q: "Do you provide BDIX optimized hosting?", a: "Yes, our BDIX server series is specifically optimized for local visitors to ensure 10x faster response times within Bangladesh." },
        { q: "Do you provide free SSL?", a: "Yes, all our hosting plans come with unlimited free Let's Encrypt SSL certificates." },
        { q: "What control panel do you use?", a: "We use the industry-standard cPanel for all our shared and reseller hosting plans." }
    ];

    return (
        <section className="py-24 bg-gray-50/30" id="faq">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#f37021]/10 text-[#f37021] mb-4">
                        <HelpCircle size={24} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                    <Accordion type="single" collapsible className="w-full">
                        {questions.map((item, index) => (
                            <AccordionItem key={index} value={`item-${index}`} className="border-b-gray-100 last:border-0 px-4">
                                <AccordionTrigger className="text-left font-bold text-gray-800 hover:text-[#f37021] hover:no-underline py-6">
                                    {item.q}
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-500 leading-relaxed pb-6">
                                    {item.a}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    );
}
