import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'İletişime Geçin - Tayfun Taşdemir | İletişim Formu & WhatsApp',
  description: 'Yazılım projeleriniz, iş ortaklığı teklifleriniz veya sorularınız için benimle iletişime geçin. İletişim formunu doldurabilir veya doğrudan WhatsApp\'tan yazabilirsiniz.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
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
            "name": "İletişim",
            "item": "https://tayfuntasdemir.com.tr/contact"
          }
        ]
      },
      {
        "@type": "ContactPage",
        "@id": "https://tayfuntasdemir.com.tr/contact#webpage",
        "url": "https://tayfuntasdemir.com.tr/contact",
        "name": "İletişim - Tayfun Taşdemir",
        "description": "Tayfun Taşdemir ile iletişime geçmek için kullanabileceğiniz iletişim formu, e-posta ve WhatsApp bilgileri."
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Tayfun Taşdemir'e en hızlı nasıl ulaşabilirim?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sitedeki iletişim formunu kullanarak ya da sağ altta bulunan WhatsApp butonu üzerinden doğrudan hızlıca iletişime geçebilirsiniz."
            }
          },
          {
            "@type": "Question",
            "name": "Gönderdiğim mesajlara ne kadar sürede geri dönüş alırım?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "İletişim formu veya e-posta yoluyla gönderilen mesajlara genellikle 24 saat içerisinde dönüş yapılmaktadır."
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
