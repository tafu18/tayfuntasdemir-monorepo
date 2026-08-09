import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const remoteUser = request.headers.get('remote-user');
  const remoteEmail = request.headers.get('remote-email');

  // Nginx / Authelia header'ı kontrolü
  if (!remoteUser && !remoteEmail) {
    return NextResponse.json(
      { error: 'No SSO credentials provided by proxy' },
      { status: 401 }
    );
  }

  try {
    const apiUrl = process.env.INTERNAL_API_URL || 'http://backend:4000';
    const jwtSecret = process.env.JWT_SECRET || 'supersecretjwtkey123!';

    const response = await fetch(`${apiUrl}/api/auth/sso`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secretKey: jwtSecret,
        email: remoteEmail || undefined,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'SSO Backend Auth Failed', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('SSO Route Error:', err);
    return NextResponse.json(
      { error: 'Internal SSO Server Error', message: err.message },
      { status: 500 }
    );
  }
}
