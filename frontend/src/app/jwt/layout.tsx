import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JWT Decoder & Parser - JSON Web Token Çözücü',
  description: 'JSON Web Token (JWT) içeriklerini (Header, Payload, Expiration) anında güvenle ayrıştırın ve inceleyin.',
  keywords: ['JWT Decoder', 'JWT Parser', 'JSON Web Token', 'JWT Token Çözücü', 'JWT Expiration Check'],
};

export default function JwtLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
