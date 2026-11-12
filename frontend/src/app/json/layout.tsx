import type { Metadata } from 'next';
import { withSeo } from '@/lib/seo';

export const metadata: Metadata = withSeo('/json', {
  title: 'JSON Formatter & Validator - Online JSON Düzenleyici',
  description: 'JSON verilerinizi biçimlendirin, doğrulayın (validate), minify edin ve okunabilir ağaç yapısında inceleyin.',
  keywords: ['JSON Formatter', 'JSON Validator', 'JSON Beautifier', 'JSON Minify', 'JSON Düzenleyici'],
});

export default function JsonLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
