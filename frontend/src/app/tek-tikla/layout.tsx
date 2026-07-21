import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tek Tıkla Mobil Uygulaması | Hızlı Web Erişimi & Yer İmleri',
  description: 'Tek Tıkla iOS ve Android mobil uygulaması. Favori web sitelerinizi düzenleyin, kategorilere ayırın ve tek bir tıkla anında erişin.',
  keywords: ['Tek Tıkla', 'Web Yer İmleri', 'Bookmark Yöneticisi', 'Hızlı İnternet Erişimi', 'Mobil Uygulama'],
  openGraph: {
    title: 'Tek Tıkla | Hızlı Web Erişimi Uygulaması',
    description: 'Favori sitelerinizi tek tıkla açın, kategorilere göre düzenleyin.',
    images: ['/tektiklaLogo.png'],
  },
};

export default function TekTiklaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
