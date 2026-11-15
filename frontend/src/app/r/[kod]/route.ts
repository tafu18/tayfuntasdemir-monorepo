import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ kod: string }> },
) {
  const { kod } = await context.params;
  const apiBase =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:4000';

  try {
    const res = await fetch(
      `${apiBase.replace(/\/$/, '')}/api/r/${encodeURIComponent(kod)}`,
      { redirect: 'manual', cache: 'no-store' },
    );

    const location = res.headers.get('location');
    if (res.status >= 300 && res.status < 400 && location) {
      return NextResponse.redirect(location, 302);
    }

    const body = await res.json().catch(() => null);
    const message = body?.message || 'Kısa link bulunamadı';

    return new NextResponse(
      `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>KısaLink — ${res.status}</title><style>body{margin:0;font-family:system-ui,-apple-system,sans-serif;background:#09090b;color:#f4f4f5;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px}.card{max-width:420px;width:100%;border:1px solid #27272a;background:#18181b;border-radius:16px;padding:32px;text-align:center}h1{margin:0 0 8px;font-size:28px}p{margin:0 0 24px;color:#a1a1aa;font-size:15px}a{display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 20px;border-radius:10px;font-weight:600;font-size:14px}</style></head><body><div class="card"><h1>${res.status}</h1><p>${message}</p><a href="/kisa-link">KısaLink'e Dön</a></div></body></html>`,
      {
        status: res.status === 410 ? 410 : 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      },
    );
  } catch {
    return NextResponse.json({ message: 'API sunucusuna ulaşılamadı' }, { status: 502 });
  }
}
