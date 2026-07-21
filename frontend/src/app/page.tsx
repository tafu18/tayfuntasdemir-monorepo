import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Tayfun Taşdemir | Kişisel Blog & Portfolyo - Full-Stack Developer',
  description: 'Tayfun Taşdemir\'in kişisel blogu ve portfolyosu. PHP, Laravel, NestJS, Next.js ve modern web teknolojileri üzerine yazılar, projeler ve geliştirici araçları.',
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://tayfuntasdemir.com.tr/#website",
        "url": "https://tayfuntasdemir.com.tr",
        "name": "Tayfun Taşdemir | Kişisel Blog & Portfolyo",
        "description": "Yazılım, teknoloji ve projeler."
      },
      {
        "@type": "Person",
        "@id": "https://tayfuntasdemir.com.tr/#person",
        "name": "Tayfun Taşdemir",
        "jobTitle": "Full-Stack Developer",
        "url": "https://tayfuntasdemir.com.tr",
        "sameAs": [
          "https://github.com/tayfuntasdemir",
          "https://linkedin.com/in/tayfuntasdemir"
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Tayfun Taşdemir kimdir?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Tayfun Taşdemir, backend ve web geliştirme alanında uzmanlaşmış; PHP, Laravel, NestJS, MySQL, PostgreSQL, BullMQ, SQS, Next.js ve Expo/React Native teknolojileriyle ölçeklenebilir yazılım çözümleri geliştiren bir bilgisayar mühendisidir."
            }
          },
          {
            "@type": "Question",
            "name": "Hangi mobil uygulamaları geliştirdiniz?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "İbadet ve namaz vakitleri asistanı olan 'Vakt-i Huzur' ve web kısayollarınızı organize eden 'Tek Tıkla' mobil uygulamalarını geliştirdim."
            }
          },
          {
            "@type": "Question",
            "name": "Web sitesinde hangi geliştirici araçları bulunuyor?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yazılımcılar için interaktif Code Diff karşılaştırıcı, JWT Decoder, JSON Formatter, Base64 dönüştürücü ve Unix Epoch çevirici gibi araçlar sunmaktayım."
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
      <HomeClient />
    </>
  );
}
