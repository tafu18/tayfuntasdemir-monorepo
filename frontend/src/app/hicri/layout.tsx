import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Miladi - Hicri Takvim Dönüştürücü | Tayfun Taşdemir',
  description: 'Miladi tarihleri Hicri tarihlere, Hicri tarihleri Miladi tarihlere anında ve doğru şekilde dönüştürün.',
};

export default function HicriLayout({ children }: { children: React.ReactNode }) {
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
            "name": "Miladi - Hicri Dönüştürücü",
            "item": "https://tayfuntasdemir.com.tr/hicri"
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
