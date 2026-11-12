import type { Metadata } from 'next';
import { withSeo } from '@/lib/seo';

export const metadata: Metadata = withSeo('/password-generator', {
  title: 'Güçlü Şifre Oluşturucu - Online Password Generator',
  description: 'Rastgele, güvenli ve kırılması zor güçlü şifreler oluşturun. Uzunluk ve karakter seçeneklerini özelleştirin.',
  keywords: ['Şifre Oluşturucu', 'Password Generator', 'Güçlü Parola Üretici', 'Rastgele Şifre'],
});

export default function PasswordGeneratorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
