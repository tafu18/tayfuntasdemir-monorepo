import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projelerim - Web & Mobil Uygulamalar | Tayfun Taşdemir',
  description: 'Tayfun Taşdemir\'in geliştirdiği mobil uygulamalar (Vakt-i Huzur, Tek Tıkla), API servisleri (Pusula API) ve açık kaynak kodlu web projelerinin detayları.',
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
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
            "name": "Projelerim",
            "item": "https://tayfuntasdemir.com.tr/projects"
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
