import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Namaz Vakitleri & Ezan Saatleri - Vakt-i Huzur | Tayfun Taşdemir',
  description: 'Tüm il ve ilçelerin günlük ezan saatleri, imsakiye, sabah, öğle, ikindi, akşam ve yatsı namaz vakitlerini takip edin. Vakt-i Huzur namaz vakitleri servisi.',
};

export default function NamazVakitleriLayout({ children }: { children: React.ReactNode }) {
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
            "name": "Namaz Vakitleri",
            "item": "https://tayfuntasdemir.com.tr/namaz-vakitleri"
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Namaz vakitleri verileri güncel ve güvenilir mi?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Evet, namaz vakitleri ezan saatleri verileri doğrudan Diyanet İşleri Başkanlığı ile %100 uyumlu olarak Vakt-i Huzur API altyapısından anlık çekilmektedir."
            }
          },
          {
            "@type": "Question",
            "name": "Vakt-i Huzur uygulaması nedir?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Vakt-i Huzur, namaz vakitlerini bildiren, ezan alarmı, kıble yönü bulucu, zikirmatik ve günlük dini ayet/hadis paylaşımları sunan modern bir mobil uygulamadır."
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
