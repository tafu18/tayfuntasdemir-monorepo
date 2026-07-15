import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';

  // 1. Durum: İstek admin subdomain'inden mi geliyor? (örn: admin.tayfuntasdemir.com.tr)
  const isAdminSubdomain = host.startsWith('admin.');

  if (isAdminSubdomain) {
    // Statik kaynaklar, API'ler ve dahili Next.js isteklerini pas geç
    if (
      url.pathname.startsWith('/_next') || 
      url.pathname.startsWith('/api') || 
      url.pathname.includes('.')
    ) {
      return NextResponse.next();
    }

    // Eğer istek zaten /admin ile başlamıyorsa, arka planda /admin klasörüne yönlendir (rewrite)
    if (!url.pathname.startsWith('/admin')) {
      // Örn: admin.tayfuntasdemir.com.tr/ -> /admin/
      // Örn: admin.tayfuntasdemir.com.tr/posts -> /admin/posts
      url.pathname = `/admin${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  } else {
    // 2. Durum: Ana domainden (tayfuntasdemir.com.tr) /admin sayfasına erişilmeye çalışılıyorsa
    // Kullanıcıyı otomatik olarak admin subdomain'ine yönlendir (redirect)
    if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) {
      const cleanPath = url.pathname.replace(/^\/admin/, '');
      const proto = request.headers.get('x-forwarded-proto') || 'https';
      
      // Ana domain adını dinamik olarak veya doğrudan tayfuntasdemir.com.tr üzerinden oluştur
      const baseDomain = host.replace(/^www\./, '');
      const redirectUrl = `${proto}://admin.${baseDomain}${cleanPath}${url.search}`;
      
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

// Sadece sayfa rotalarında çalışması için matcher yapılandırması
export const config = {
  matcher: [
    /*
     * Aşağıdaki yollar dışındaki tüm istek yollarıyla eşleş:
     * - api (API rotaları)
     * - _next/static (statik dosyalar)
     * - _next/image (resim optimizasyon dosyaları)
     * - favicon.ico, icon.png vb. (statik dosyalar)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
