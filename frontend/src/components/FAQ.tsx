'use client';

import React from 'react';
import { FAQSections, FAQItem as UIFAQItem } from '@/components/ui/faq-sections';
import { cn } from '@/lib/utils';

export type FAQItem = UIFAQItem;

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
  // Structured Data for Google Rich Results (Schema.org / FAQPage)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (items || []).map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <section className={cn('py-6 my-8 rounded-3xl bg-zinc-50/60 dark:bg-zinc-900/30 border border-zinc-200/60 dark:border-zinc-800/60 p-4 md:p-6 shadow-sm', className)}>
      {/* Schema.org FAQ JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <FAQSections
        badge="S.S.S"
        title={title}
        description={subtitle}
        faqs={items}
      />
    </section>
  );
}
