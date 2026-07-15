import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Regex Tester - Düzenli İfade Test Aracı | Tayfun Taşdemir',
  description: 'Yazdığınız düzenli ifadeleri (Regular Expressions) örnek metinler üzerinde anında eşleşme vurgulamalarıyla test edin.',
};

export default function RegexLayout({ children }: { children: React.ReactNode }) {
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
            "name": "Regex Tester",
            "item": "https://tayfuntasdemir.com.tr/regex"
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
