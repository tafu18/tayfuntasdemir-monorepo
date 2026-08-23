'use client';

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { FAQItem } from "./faq-sections";

export interface FAQDemoProps {
    badge?: string;
    title?: string;
    description?: string;
    faqs?: FAQItem[];
    className?: string;
}

const defaultDemoFaqs: FAQItem[] = [
    {
        question: 'Lightning-Fast Performance',
        answer: 'Built with speed — minimal load times and optimized rendering.'
    },
    {
        question: 'Fully Customizable Components',
        answer: 'Easily adjust styles, structure, and behavior to match your project needs.'
    },
    {
        question: 'Responsive by Default',
        answer: 'Every component are responsive by default — no extra CSS required.'
    },
    {
        question: 'Tailwind CSS Powered',
        answer: 'Built using Tailwind utility classes — no extra CSS or frameworks required.'
    },
    {
        question: 'Dark Mode Support',
        answer: 'All components come ready with light and dark theme support out of the box.'
    }
];

export function FAQDemo({
    badge = "FAQ",
    title = "Frequently Asked Questions",
    description = "Proactively answering FAQs boosts user confidence and cuts down on support tickets.",
    faqs = defaultDemoFaqs,
    className,
}: FAQDemoProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className={cn('flex flex-col items-center text-center px-3 py-8', className)}>
            {badge && (
                <p className='text-base font-medium text-slate-600 dark:text-zinc-400'>
                    {badge}
                </p>
            )}
            <h2 className='text-3xl md:text-4xl font-semibold text-slate-800 dark:text-zinc-100 mt-2'>
                {title}
            </h2>
            {description && (
                <p className='text-sm text-slate-500 dark:text-zinc-400 mt-4 max-w-sm'>
                    {description}
                </p>
            )}
            <div className='max-w-xl w-full mt-6 flex flex-col gap-4 items-start text-left'>
                {faqs.map((faq, index) => {
                    const isOpen = openIndex === index;
                    return (
                        <div key={index} className='flex flex-col items-start w-full'>
                            <div
                                className='flex items-center justify-between w-full cursor-pointer bg-gradient-to-r from-indigo-50 to-white dark:from-zinc-800/80 dark:to-zinc-900 border border-indigo-100 dark:border-zinc-700/60 p-4 rounded-lg shadow-sm hover:border-indigo-200 dark:hover:border-zinc-600 transition-colors'
                                onClick={() => toggleFAQ(index)}
                            >
                                <h3 className='text-sm font-medium text-slate-800 dark:text-zinc-100'>
                                    {faq.question}
                                </h3>
                                <ChevronDown
                                    className={cn(
                                        "w-4 h-4 shrink-0 text-slate-700 dark:text-zinc-300 transition-transform duration-300 ease-in-out",
                                        isOpen && "rotate-180"
                                    )}
                                />
                            </div>
                            <div
                                className={cn(
                                    "transition-all duration-300 ease-in-out overflow-hidden w-full",
                                    isOpen
                                        ? "opacity-100 max-h-[300px] translate-y-0 pt-4"
                                        : "opacity-0 max-h-0 -translate-y-2"
                                )}
                            >
                                <p className="text-sm text-slate-500 dark:text-zinc-400 px-4 leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default FAQDemo;
