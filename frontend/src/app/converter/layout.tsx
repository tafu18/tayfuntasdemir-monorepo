import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Format Dönüştürücü & PDF/Görsel Atölyesi',
  description: 'Tamamen tarayıcınızda (client-side) çalışan, güvenli dosya dönüştürme ve manipülasyon aracı. Görsel format dönüştürme, arka plan kaldırma, PDF birleştirme ve düzenleme ile Word to PDF dönüştürme.',
  keywords: ['Dosya Dönüştürücü', 'Format Dönüştürücü', 'PDF Birleştirme', 'PDF Düzenleme', 'Word PDF Çevirme', 'Arka Plan Kaldırma', 'Client-side PDF'],
  openGraph: {
    title: 'Güvenli Format Dönüştürücü | %100 Yerel',
    description: 'Dosyalarınız hiçbir sunucuya yüklenmeden, tarayıcınızda güvenle işlenir.',
    images: ['/icon.png'],
  },
};

export default function ConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
