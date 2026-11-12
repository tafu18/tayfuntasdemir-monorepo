import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';

const MAX_TITLE = 110;
const MAX_SUBTITLE = 140;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get('title') || 'Tayfun Taşdemir').slice(0, MAX_TITLE);
  const subtitle = (
    searchParams.get('subtitle') || 'Yazılım Uzmanı · Blog · Ücretsiz Geliştirici Araçları'
  ).slice(0, MAX_SUBTITLE);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: 'linear-gradient(135deg, #0b1120 0%, #111827 55%, #1e3a8a 100%)',
          color: '#f8fafc',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 34,
              fontWeight: 800,
            }}
          >
            TT
          </div>
          <div style={{ fontSize: 30, color: '#cbd5e1', display: 'flex' }}>tayfuntasdemir.com.tr</div>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: title.length > 60 ? 58 : 72,
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: -1,
          }}
        >
          {title}
        </div>

        <div style={{ display: 'flex', fontSize: 30, color: '#93c5fd' }}>{subtitle}</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
      },
    },
  );
}
