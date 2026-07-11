import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Yazılım & Teknoloji Blogu | Tayfun Taşdemir',
  description: 'Laravel, NestJS, Next.js, clean code prensipleri ve veritabanı optimizasyonu üzerine güncel teknik makaleler ve rehberler.',
};

export default function PostsLayout({ children }: { children: React.ReactNode }) {
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
            "name": "Gönderiler",
            "item": "https://tayfuntasdemir.com.tr/posts"
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
