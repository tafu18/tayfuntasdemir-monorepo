import type { Metadata } from 'next';
import { withSeo } from '@/lib/seo';

export const metadata: Metadata = withSeo('/uptime', {
  title: 'Uptime & SSL Sertifika Monitörü - Site Takip Aracı',
  description:
    'Web sitelerinizi ve API servislerinizi 5 dakikada bir otomatik kontrol edin, SSL sertifika bitiş süresini izleyin ve kesintilerde e-posta uyarısı alın.',
  keywords: ['Uptime Monitor', 'SSL Checker', 'Site Takip', 'API Monitoring'],
});

export default function UptimeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
