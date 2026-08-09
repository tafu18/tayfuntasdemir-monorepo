import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'cURL Dönüştürücü (cURL to Fetch, Axios, Python, Go, PHP) - Tayfun Taşdemir',
  description: 'cURL komutlarını anında JavaScript Fetch, Axios, Python Requests, PHP Guzzle, Go ve C# kodlarına dönüştürün. API test ve entegrasyon aracı.',
  keywords: [
    'cURL to Fetch',
    'cURL to Axios',
    'cURL to Python',
    'cURL to PHP',
    'cURL to Go',
    'cURL Dönüştürücü',
    'cURL Converter',
    'API Kod Üretici',
    'cURL Parser'
  ],
  openGraph: {
    title: 'cURL Dönüştürücü (cURL to Fetch, Axios, Python, Go, PHP)',
    description: 'cURL komutlarınızı tüm popüler programlama dillerine anında dönüştürün.',
    type: 'website',
  },
};

export default function CurlConverterLayout({ children }: { children: React.ReactNode }) {
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
            "name": "cURL Dönüştürücü",
            "item": "https://tayfuntasdemir.com.tr/curl-converter"
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
