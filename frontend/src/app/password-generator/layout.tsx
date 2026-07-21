import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Güçlü Şifre Oluşturucu - Online Password Generator',
  description: 'Rastgele, güvenli ve kırılması zor güçlü şifreler oluşturun. Uzunluk ve karakter seçeneklerini özelleştirin.',
  keywords: ['Şifre Oluşturucu', 'Password Generator', 'Güçlü Parola Üretici', 'Rastgele Şifre'],
};

export default function PasswordGeneratorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
