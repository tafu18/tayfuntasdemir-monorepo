import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unix Epoch Converter - Zaman Damgası Dönüştürücü | Tayfun Taşdemir',
  description: 'Unix zaman damgası (Epoch timestamp) değerlerini insan tarafından okunabilir tarihlere ve tarihleri Unix saniyelerine dönüştürün.',
};

export default function EpochLayout({ children }: { children: React.ReactNode }) {
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
            "name": "Unix Epoch Dönüştürücü",
            "item": "https://tayfuntasdemir.com.tr/epoch"
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
