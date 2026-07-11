import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Güvenli Şifre Oluşturucu - Password Generator | Tayfun Taşdemir',
  description: 'Hesaplarınızın güvenliği için kırılması zor, karmaşık, rastgele ve güçlü şifreler oluşturun. Büyük/küçük harf, rakam ve sembol seçenekleriyle şifre üretici.',
};

export default function PasswordGeneratorLayout({ children }: { children: React.ReactNode }) {
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
            "name": "Şifre Oluşturucu",
            "item": "https://tayfuntasdemir.com.tr/password-generator"
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Şifre oluşturucu aracınız güvenli midir?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Evet, şifre üretimi tamamen tarayıcınızın kendi bellek alanında (client-side) Javascript ile yapılır. Üretilen hiçbir şifre sunucuya gönderilmez veya kaydedilmez."
            }
          },
          {
            "@type": "Question",
            "name": "Güçlü bir şifre nasıl olmalıdır?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Güçlü bir şifre en az 12 karakter uzunluğunda olmalı; büyük harf, küçük harf, rakam ve !, @, $, %, # gibi özel karakterleri bir arada barındırmalıdır."
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
