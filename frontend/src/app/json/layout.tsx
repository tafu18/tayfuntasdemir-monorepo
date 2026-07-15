import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JSON Formatter & Validator - JSON Biçimlendirici | Tayfun Taşdemir',
  description: 'JSON verilerinizi okunabilir hale getirmek için biçimlendirin, ağaç yapısında inceleyin, doğrulayın ve sıkıştırın.',
};

export default function JsonLayout({ children }: { children: React.ReactNode }) {
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
            "name": "JSON Formatter",
            "item": "https://tayfuntasdemir.com.tr/json"
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
