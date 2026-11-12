import type { Metadata } from 'next';
import { withSeo, breadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = withSeo('/game/hangman', {
  title: 'Adam Asmaca Oyna - Online Türkçe Kelime Oyunu',
  description: 'Türkçe kelimelerle Adam Asmaca oyununu tarayıcınızda ücretsiz oynayın. Harfleri tahmin edin, adamı kurtarın.',
  keywords: ['adam asmaca', 'adam asmaca oyna', 'türkçe kelime oyunu', 'hangman'],
});

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    breadcrumbJsonLd([
      { name: 'Ana Sayfa', path: '/' },
      { name: 'Uygulamalar', path: '/applications' },
      { name: 'Adam Asmaca', path: '/game/hangman' },
    ]),
    {
      '@type': 'VideoGame',
      name: 'Adam Asmaca',
      url: 'https://tayfuntasdemir.com.tr/game/hangman',
      description: 'Türkçe kelimelerle Adam Asmaca oyununu tarayıcınızda ücretsiz oynayın. Harfleri tahmin edin, adamı kurtarın.',
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
