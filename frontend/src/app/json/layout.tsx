import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JSON Formatter & Validator - Online JSON Düzenleyici',
  description: 'JSON verilerinizi biçimlendirin, doğrulayın (validate), minify edin ve okunabilir ağaç yapısında inceleyin.',
  keywords: ['JSON Formatter', 'JSON Validator', 'JSON Beautifier', 'JSON Minify', 'JSON Düzenleyici'],
};

export default function JsonLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
