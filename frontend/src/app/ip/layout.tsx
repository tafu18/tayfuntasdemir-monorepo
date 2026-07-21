import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IP Adresi Sorgulama & Konum Bulma - Benim IP Adresim Ne?',
  description: 'Public IP adresinizi, servis sağlayıcınızı (ISP), coğrafi konumunuzu ve ülke/şehir bilgilerinizi anında öğrenin.',
  keywords: ['IP Sorgulama', 'IP Adresim Ne', 'IP Konum Bulma', 'ISP Sorgulama', 'Public IP Check'],
};

export default function IpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
