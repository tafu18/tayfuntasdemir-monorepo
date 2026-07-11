import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Canlı Döviz Kurları & Altın Fiyatları Takibi | Tayfun Taşdemir',
  description: 'Güncel ve anlık döviz kurları (Dolar, Euro, Sterlin) ve altın fiyatları (Gram Altın, Çeyrek Altın, Ons Altın) takibi yapabileceğiniz pratik araç.',
};

export default function DovizLayout({ children }: { children: React.ReactNode }) {
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
            "name": "Döviz Kurları",
            "item": "https://tayfuntasdemir.com.tr/doviz"
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
