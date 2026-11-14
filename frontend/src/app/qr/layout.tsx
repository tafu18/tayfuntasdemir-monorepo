import type { Metadata } from 'next';
import { withSeo } from '@/lib/seo';

export const metadata: Metadata = withSeo('/qr', {
  title: 'QR Kod Oluşturucu - Metin, URL, Wi-Fi, E-posta ve Telefon',
  description: 'Metin, URL, Wi-Fi, e-posta ve telefon için ücretsiz QR kod oluşturun. Boyut, renk ve hata düzeltme seviyesini ayarlayın, PNG veya SVG olarak indirin.',
  keywords: ['QR Kod Oluşturucu', 'QR Code Generator', 'Wi-Fi QR Kod', 'QR Kod İndir', 'PNG QR', 'SVG QR'],
});

export default function QrLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
