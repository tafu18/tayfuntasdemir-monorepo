import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web Terminal Simülatörü | Tayfun Taşdemir',
  description: 'Tarayıcınızda çalışan interaktif Linux/Unix web terminal simülatörü. Komutları deneyin ve simülasyonu yaşayın.',
};

export default function TerminalLayout({ children }: { children: React.ReactNode }) {
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
            "name": "Web Terminal",
            "item": "https://tayfuntasdemir.com.tr/tools/terminal"
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
