import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Test Verisi Üretici (TCKN, VKN, IBAN, Kredi Kartı, Plaka, UUID) - Tayfun Taşdemir',
  description: 'Yazılım ve QA testleriniz için algoritmik olarak geçerli sahte TCKN, Vergi No (VKN), TR IBAN, Test Kredi Kartı, Türk Telefon No, İsim-Soyisim, Plaka, UUID ve MAC adresi üretin. %100 İstemci taraflı (Client-Side).',
  keywords: [
    'TCKN Üretici',
    'Sahte TCKN Oluşturucu',
    'Vergi Numarası Üretici',
    'VKN Generator',
    'TR IBAN Üretici',
    'Test Kredi Kartı Üretici',
    'Test Verisi Oluşturucu',
    'Rastgele Türk İsim Üretici',
    'Türkiye Plaka Üretici',
    'UUID v4 Generator',
    'Mock Data Generator Turkey'
  ],
  openGraph: {
    title: 'Test Verisi Üretici (TCKN, VKN, IBAN, Kart, Plaka, UUID)',
    description: 'Yazılım testleriniz için algoritmik kurallara uygun gerçekçi mock test verileri oluşturun.',
    type: 'website',
  },
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
            "name": "Test Verisi Üretici",
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