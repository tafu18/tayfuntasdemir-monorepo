import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tayfun Taşdemir | Blog & Geliştirici Araçları',
    short_name: 'Tayfun Taşdemir',
    description: 'Yazılım blogu, ücretsiz geliştirici araçları ve mobil uygulamalar.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#09090b',
    lang: 'tr',
    icons: [
      { src: '/icon.png', sizes: '512x512', type: 'image/png' },
      { src: '/favicon.png', sizes: 'any', type: 'image/png' },
    ],
  };
}
