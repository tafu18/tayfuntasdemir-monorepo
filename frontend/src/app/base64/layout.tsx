import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Base64 Encoder & Decoder - Base64 Atölyesi | Tayfun Taşdemir',
  description: 'Metin veya dosyalarınızı anında Base64 formatına şifreleyin veya Base64 formatındaki verileri normal metne/dosyaya dönüştürün.',
};

export default function Base64Layout({ children }: { children: React.ReactNode }) {
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
            "name": "Base64 Atölyesi",
            "item": "https://tayfuntasdemir.com.tr/base64"
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
