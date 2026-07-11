import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ben Kimim? - Tayfun Taşdemir | Backend Developer',
  description: 'Tayfun Taşdemir kimdir? 3 yıllık deneyime sahip, PHP, Laravel, NestJS, MySQL ve Docker uzmanlığı olan backend geliştirici.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
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
            "name": "Ben Kimim?",
            "item": "https://tayfuntasdemir.com.tr/about"
          }
        ]
      },
      {
        "@type": "AboutPage",
        "@id": "https://tayfuntasdemir.com.tr/about#webpage",
        "url": "https://tayfuntasdemir.com.tr/about",
        "name": "Ben Kimim? - Tayfun Taşdemir",
        "description": "Tayfun Taşdemir'in yazılım serüveni, teknik uzmanlık alanları ve projeleri."
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Tayfun Taşdemir'in uzmanlık alanları nelerdir?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Tayfun Taşdemir; PHP, Laravel, NestJS, MySQL, Docker, Vue.js, JavaScript ve Python konularında uzmanlaşmış bir backend geliştiricidir."
            }
          },
          {
            "@type": "Question",
            "name": "Birlikte çalışma seçenekleri nelerdir?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Web uygulamaları geliştirme, API entegrasyonları, backend desteği ve performans iyileştirme projelerinde iş ortaklığı sunuyorum."
            }
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
