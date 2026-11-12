import type { Metadata } from 'next';
import { withSeo, breadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = withSeo('/game/memory', {
  title: 'Hafıza Oyunu Oyna - Kart Eşleştirme (Ücretsiz)',
  description: 'Kartları çevirip eşleri bulduğunuz ücretsiz online hafıza (memory) oyunu. Hafızanızı tarayıcıda test edin.',
  keywords: ['hafıza oyunu', 'kart eşleştirme oyunu', 'memory game', 'online hafıza oyunu'],
});

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    breadcrumbJsonLd([
      { name: 'Ana Sayfa', path: '/' },
      { name: 'Uygulamalar', path: '/applications' },
      { name: 'Hafıza Oyunu', path: '/game/memory' },
    ]),
    {
      '@type': 'VideoGame',
      name: 'Hafıza Oyunu',
      url: 'https://tayfuntasdemir.com.tr/game/memory',
      description: 'Kartları çevirip eşleri bulduğunuz ücretsiz online hafıza (memory) oyunu. Hafızanızı tarayıcıda test edin.',
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
