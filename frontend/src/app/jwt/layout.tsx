import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JWT Decoder & Debugger - JSON Web Token Çözücü | Tayfun Taşdemir',
  description: 'JSON Web Token (JWT) verilerinizin header, payload ve imza kısımlarını anında decode edin, çözün ve doğrulayın.',
};

export default function JwtLayout({ children }: { children: React.ReactNode }) {
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
            "name": "JWT Decoder",
            "item": "https://tayfuntasdemir.com.tr/jwt"
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
