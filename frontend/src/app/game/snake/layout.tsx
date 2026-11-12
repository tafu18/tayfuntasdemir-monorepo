import type { Metadata } from 'next';
import { withSeo, breadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = withSeo('/game/snake', {
  title: 'Yılan Oyunu Oyna - Online Snake (Ücretsiz)',
  description: 'Klasik yılan oyununu (Snake) tarayıcınızda indirmeden, ücretsiz oynayın. Yemleri toplayın, büyüyün ve en yüksek skoru yapın.',
  keywords: ['yılan oyunu', 'snake oyna', 'online yılan oyunu', 'nokia yılan oyunu'],
});

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    breadcrumbJsonLd([
      { name: 'Ana Sayfa', path: '/' },
      { name: 'Uygulamalar', path: '/applications' },
      { name: 'Yılan Oyunu', path: '/game/snake' },
    ]),
    {
      '@type': 'VideoGame',
      name: 'Yılan Oyunu',
      url: 'https://tayfuntasdemir.com.tr/game/snake',
      description: 'Klasik yılan oyununu (Snake) tarayıcınızda indirmeden, ücretsiz oynayın. Yemleri toplayın, büyüyün ve en yüksek skoru yapın.',
      inLanguage: 'tr-TR',
      genre: 'Casual',
      gamePlatform: 'Web Browser',
      applicationCategory: 'GameApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY' },
    },
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
