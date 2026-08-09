import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cron Expression Generator & Açıklayıcı (Crontab Rehberi) - Tayfun Taşdemir',
  description: 'Görsel arayüzle Linux Crontab, Node.js, NestJS ve Spring Boot için Cron ifadeleri oluşturun. Cron sözdizimini Türkçe insan diline çevirin ve sonraki çalışma zamanlarını görün.',
  keywords: [
    'Cron Generator',
    'Crontab Generator',
    'Cron Expression Oluşturucu',
    'Cron Türkçe Açıklayıcı',
    'Crontab Rehberi',
    'Node Cron Generator',
    'NestJS Cron Scheduler',
    'Cron Zamanlayıcı'
  ],
  openGraph: {
    title: 'Cron Expression Generator & Açıklayıcı (Crontab)',
    description: 'Linux ve Backend için interaktif Cron ifadesi üretici ve Türkçe açıklama aracı.',
    type: 'website',
  },
};

export default function CronGeneratorLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Ana Sayfa",
            "item": "https://tayfuntasdemir.com.tr"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Uygulamalar",
            "item": "https://tayfuntasdemir.com.tr/applications"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Cron Generator",
            "item": "https://tayfuntasdemir.com.tr/cron-generator"
          }
        ]
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
