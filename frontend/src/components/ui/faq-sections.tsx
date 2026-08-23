'use client';

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { HelpCircle } from "lucide-react";

export interface FAQItem {
    question: string;
    answer: string;
}

export interface FAQSectionsProps {
    badge?: string;
    title?: string;
    description?: string;
    cardTitle?: string;
    cardDescription?: string;
    cardLinkHref?: string;
    cardLinkLabel?: string;
    faqs?: FAQItem[];
    className?: string;
}

const defaultFaqs: FAQItem[] = [
    {
        question: "How to use this component?",
        answer: "To use this component, you need to import it in your project and use it in your JSX code. Here's an example of how to use it:",
    },
    {
        question: "Are there any other components available?",
        answer: "Yes, there are many other components available in this library. You can find them in the 'Components' section of the website.",
    },
    {
        question: "Are components responsive?",
        answer: "Yes, all components are responsive and can be used on different screen sizes.",
    },
    {
        question: "Can I customize the components?",
        answer: "Yes, you can customize the components by passing props to them. You can find more information about customizing components in the 'Customization' section of the website.",
    },
];

export function FAQSections({
    badge = "FAQ's",
    title = "Looking for answer?",
    description = "Ship Beautiful Frontends Without the Overhead — Customizable, Scalable and Developer-Friendly UI Components.",
    cardTitle = "Başka Bir Sorunuz Mu Var?",
    cardDescription = "Sıkça sorulan sorular haricinde aklınıza takılan bir konu veya merak ettiğiniz detaylar için benimle doğrudan iletişime geçebilirsiniz.",
    cardLinkHref = "/contact",
    cardLinkLabel = "İletişime Geçin",
    faqs = defaultFaqs,
    className,
}: FAQSectionsProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className={cn("max-w-4xl mx-auto flex flex-col md:flex-row items-stretch justify-center gap-8 px-4 md:px-0 py-6", className)}>
            {/* Left Card - FAQ / Help Card */}
            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8 flex flex-col items-center text-center hover:shadow-xl transition-all duration-300 max-w-sm w-full shrink-0">
                <HelpCircle className="h-12 w-12 text-indigo-600 dark:text-indigo-400 mb-4" />
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
                    {cardTitle}
                </h3>
                <p className="text-zinc-650 dark:text-zinc-400 text-sm mb-6 leading-relaxed flex-grow">
                    {cardDescription}
                </p>
                <Link
                    href={cardLinkHref}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                    {cardLinkLabel} &rarr;
                </Link>
            </div>

            {/* Right Side - FAQ Accordion List */}
            <div className="w-full">
                {badge && (
                    <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                        {badge}
                    </p>
                )}
                <h2 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
                    {title}
                </h2>
                {description && (
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 pb-4">
                        {description}
                    </p>
                )}
                {faqs.map((faq, index) => (
                    <div
                        className="border-b border-slate-200 dark:border-zinc-800 py-4 cursor-pointer"
                        key={index}
                        onClick={() => toggleFAQ(index)}
                    >
                        <div className="flex items-center justify-between gap-4">
                            <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                                {faq.question}
                            </h3>
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 18 18"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className={cn(
                                    "shrink-0 transition-all duration-500 ease-in-out stroke-zinc-800 dark:stroke-zinc-200",
                                    openIndex === index ? "rotate-180" : ""
                                )}
                            >
                                <path
                                    d="m4.5 7.2 3.793 3.793a1 1 0 0 0 1.414 0L13.5 7.2"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <p
                            className={cn(
                                "text-sm text-slate-500 dark:text-zinc-400 transition-all duration-500 ease-in-out max-w-md",
                                openIndex === index
                                    ? "opacity-100 max-h-[300px] translate-y-0 pt-4"
                                    : "opacity-0 max-h-0 -translate-y-2 overflow-hidden"
                            )}
                        >
                            {faq.answer}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FAQSections;
