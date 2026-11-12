import type { Metadata } from 'next';
import { withSeo, breadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = withSeo('/pusula-api', {
  title: 'PusulaAPI - Online REST API Test Aracı (Postman Alternatifi)',
  description: 'Tarayıcı üzerinden REST API istekleri gönderin; GET, POST, PUT, DELETE, header ve body ile endpointlerinizi hızlıca test edin.',
  keywords: ['api test aracı', 'online rest client', 'postman alternatifi', 'http istek gönderme'],
});

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    breadcrumbJsonLd([
      { name: 'Ana Sayfa', path: '/' },
      { name: 'Uygulamalar', path: '/applications' },
      { name: 'PusulaAPI', path: '/pusula-api' },
    ]),
    {
      '@type': 'SoftwareApplication',
      name: 'PusulaAPI',
      url: 'https://tayfuntasdemir.com.tr/pusula-api',
      description: 'Tarayıcı üzerinden REST API istekleri gönderin; GET, POST, PUT, DELETE, header ve body ile endpointlerinizi hızlıca test edin.',
      inLanguage: 'tr-TR',
      applicationCategory: 'DeveloperApplication',
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
