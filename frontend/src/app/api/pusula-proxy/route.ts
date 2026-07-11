import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { url, method, headers, bodyType, jsonBody } = data;

    if (!url || !method) {
      return NextResponse.json({ error: 'URL ve Method zorunludur.' }, { status: 400 });
    }

    const fetchOptions: RequestInit = {
      method,
      headers: headers || {},
    };

    if (method !== 'GET' && method !== 'HEAD' && bodyType === 'json') {
      fetchOptions.body = jsonBody;
    }

    const res = await fetch(url, fetchOptions);

    // Dönen sonucu al
    const resHeaders: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      resHeaders[key] = value;
    });

    const contentType = res.headers.get('content-type') || '';
    let responseBody: any;

    if (contentType.includes('application/json')) {
      responseBody = await res.json();
    } else {
      responseBody = await res.text();
    }

    return NextResponse.json({
      status: res.status,
      headers: resHeaders,
      body: responseBody
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'API Proxy isteği başarısız oldu.' }, { status: 500 });
  }
}
