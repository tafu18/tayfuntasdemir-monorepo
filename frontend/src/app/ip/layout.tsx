import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IP Adresim Nedir? - IP Adresi & Konum Sorgulama | Tayfun Taşdemir',
  description: 'Mevcut dış IP adresinizi, tarayıcı bilgilerinizi, internet sağlayıcınızı (ISP) ve coğrafi konum detaylarınızı anında görün.',
};

export default function IpLayout({ children }: { children: React.ReactNode }) {
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
            "name": "IP Adresim",
            "item": "https://tayfuntasdemir.com.tr/ip"
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
