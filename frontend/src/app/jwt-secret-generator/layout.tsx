import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JWT Secret Key & Token Generator - Güvenli ve Client-Side',
  description: 'HS256, HS384, HS512 için kriptografik olarak güvenli JWT Secret Key ve JWT Token oluşturun. %100 İstemci taraflı (Client-Side), sıfır sunucu kaydı.',
  keywords: [
    'JWT Secret Generator',
    'JWT Key Generator',
    'JSON Web Token Generator',
    'HS256 Secret Generator',
    'HS512 Key Generator',
    'JWT Token Üretici',
    'Client Side JWT Generator',
    'Güvenli Secret Key'
  ],
  openGraph: {
    title: 'JWT Secret Key & Token Generator - Güvenli ve Client-Side',
    description: 'Tarayıcınızda %100 istemci taraflı, güvenli JWT Secret Key ve Token üretin.',
    type: 'website',
  },
};

export default function JwtSecretGeneratorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
