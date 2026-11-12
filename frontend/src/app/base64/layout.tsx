import type { Metadata } from 'next';
import { withSeo } from '@/lib/seo';

export const metadata: Metadata = withSeo('/base64', {
  title: 'Base64 Encoder & Decoder - Metin ve Görsel Çevirici',
  description: 'Metinleri ve dosyaları Base64 formatına dönüştürün veya Base64 dizgilerini çözün (encode/decode).',
  keywords: ['Base64 Encoder', 'Base64 Decoder', 'Base64 Çevirici', 'Base64 Metin Dönüştürücü'],
});

export default function Base64Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
