'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  title?: string;
  subtitle?: string;
  items: FAQItem[];
  className?: string;
}

export default function FAQ({
  title = 'Sıkça Sorulan Sorular',
  subtitle = 'Merak ettiğiniz tüm sorular ve yanıtları',
  items,
  className = '',
}: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Structured Data for Google Rich Results (Schema.org / FAQPage)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <section className={`py-12 my-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 p-6 md:p-10 shadow-sm ${className}`}>
      {/* Schema.org FAQ JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blue/10 dark:bg-blue-500/10 border border-brand-blue/20 dark:border-blue-500/20 text-brand-blue dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-4 h-4" />
            <span>S.S.S</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base mt-2 max-w-2xl mx-auto font-medium">
              {subtitle}
            </p>
          )}
        </div>

        <div className="space-y-4 w-full">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="w-full border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden transition-colors hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 dark:focus-visible:ring-blue-500/40 select-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 text-base md:text-lg min-w-0 flex-1 break-words">
                    {item.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="shrink-0 text-zinc-400 dark:text-zinc-500"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden w-full"
                    >
                      <div className="px-6 pb-5 pt-2 text-zinc-600 dark:text-zinc-400 text-sm md:text-base leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 break-words">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
