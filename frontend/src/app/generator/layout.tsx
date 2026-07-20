import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rastgele Veri Üretici (Auto Generate) - Tayfun Taşdemir',
  description: 'Test süreçleriniz için kurallara uygun rastgele Şasi Numarası (VIN), Plaka, UUID ve Güvenli Şifre gibi veriler oluşturun.',
};

export default function GeneratorLayout({ children }: { children: React.ReactNode }) {
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
            "name": "Veri Üretici",
            "item": "https://tayfuntasdemir.com.tr/generator"
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