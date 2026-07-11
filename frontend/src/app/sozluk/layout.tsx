import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Yazılım & Bilişim Terimleri Sözlüğü | Tayfun Taşdemir',
  description: 'Yazılım ve teknoloji dünyasında kullanılan terimlerin İngilizce-Türkçe anlamları, detaylı açıklamaları ve kullanım örnekleri.',
};

export default function SozlukLayout({ children }: { children: React.ReactNode }) {
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
            "name": "Yazılım Sözlüğü",
            "item": "https://tayfuntasdemir.com.tr/sozluk"
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
