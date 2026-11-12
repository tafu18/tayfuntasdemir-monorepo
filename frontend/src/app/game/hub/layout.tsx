import type { Metadata } from 'next';
import { withSeo, breadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = withSeo('/game/hub', {
  title: 'Online Oyun Salonu - Ücretsiz Tarayıcı Oyunları',
  description: 'Yılan, Mayın Tarlası, Adam Asmaca ve Hafıza oyunu gibi ücretsiz, indirmesiz, tarayıcıda oynanan nostaljik mini oyunlar.',
  keywords: ['online oyun', 'ücretsiz tarayıcı oyunları', 'indirmesiz oyun', 'mini oyunlar'],
});

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    breadcrumbJsonLd([
      { name: 'Ana Sayfa', path: '/' },
      { name: 'Uygulamalar', path: '/applications' },
      { name: 'Oyun Salonu', path: '/game/hub' },
    ]),
    {
      '@type': 'CollectionPage',
      name: 'Oyun Salonu',
      url: 'https://tayfuntasdemir.com.tr/game/hub',
      description: 'Yılan, Mayın Tarlası, Adam Asmaca ve Hafıza oyunu gibi ücretsiz, indirmesiz, tarayıcıda oynanan nostaljik mini oyunlar.',
      inLanguage: 'tr-TR',
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
