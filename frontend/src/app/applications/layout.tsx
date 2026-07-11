import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Geliştirici Araçları & Mobil Uygulamalar | Tayfun Taşdemir',
  description: 'Yazılımcılar ve web geliştiriciler için hayatı kolaylaştıran araçlar: Code Diff, JWT Decoder, JSON Formatter, IP adresi bulucu ve eğlenceli tarayıcı oyunları.',
};

export default function ApplicationsLayout({ children }: { children: React.ReactNode }) {
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
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Hangi geliştirici araçları mevcut?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Code Diff karşılaştırıcı, JWT Decoder çözücü, JSON Formatter biçimlendirici, Base64 dönüştürücü, IP adresi tespit etme ve Unix Epoch dönüştürücü gibi çeşitli araçlar mevcuttur."
            }
          },
          {
            "@type": "Question",
            "name": "Bu araçlar ücretsiz mi ve veri saklıyor mu?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Evet, tüm araçlar tamamen ücretsizdir ve işlemler tarayıcınızda (client-side) yapıldığı için verileriniz hiçbir sunucuya kaydedilmez, güvenlidir."
            }
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
