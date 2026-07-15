import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Code Diff Karşılaştırıcı - İki Kodu Karşılaştır | Tayfun Taşdemir',
  description: 'Eski ve yeni kod blokları arasındaki farkları dikey sürgüyle etkileşimli olarak karşılaştırın. Clean code ve refactoring için ideal.',
};

export default function CodeDiffLayout({ children }: { children: React.ReactNode }) {
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
            "name": "Code Diff Karşılaştırıcı",
            "item": "https://tayfuntasdemir.com.tr/code-diff"
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
