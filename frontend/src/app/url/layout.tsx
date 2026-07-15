import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'URL Encoder & Decoder - URL Dönüştürücü | Tayfun Taşdemir',
  description: 'Web adresleriniz ve parametreleriniz için URL şifreleme (percent encoding) ve URL çözme işlemlerini güvenle gerçekleştirin.',
};

export default function UrlLayout({ children }: { children: React.ReactNode }) {
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
            "name": "URL Encoder Decoder",
            "item": "https://tayfuntasdemir.com.tr/tools/url"
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
