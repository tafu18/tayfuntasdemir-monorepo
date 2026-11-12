import type { Metadata } from 'next';
import { withSeo, breadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = withSeo('/game/minesweeper', {
  title: 'Mayın Tarlası Oyna - Online Minesweeper (Ücretsiz)',
  description: 'Klasik Mayın Tarlası (Minesweeper) oyununu tarayıcınızda ücretsiz oynayın. Mayınlara basmadan tüm kareleri açın.',
  keywords: ['mayın tarlası', 'minesweeper oyna', 'online mayın tarlası', 'windows mayın tarlası'],
});

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    breadcrumbJsonLd([
      { name: 'Ana Sayfa', path: '/' },
      { name: 'Uygulamalar', path: '/applications' },
      { name: 'Mayın Tarlası', path: '/game/minesweeper' },
    ]),
    {
      '@type': 'VideoGame',
      name: 'Mayın Tarlası',
      url: 'https://tayfuntasdemir.com.tr/game/minesweeper',
      description: 'Klasik Mayın Tarlası (Minesweeper) oyununu tarayıcınızda ücretsiz oynayın. Mayınlara basmadan tüm kareleri açın.',
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
