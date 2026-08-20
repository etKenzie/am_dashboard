import { NextRequest, NextResponse } from 'next/server';

const AOP_UPSTREAM_BASE = 'https://akumaju.com/ak-mj';

function getAopApiToken(): string {
  const raw =
    process.env.AM_MAIN_API_URL_TOKEN_2 ??
    process.env.NEXT_PUBLIC_AM_MAIN_API_URL_TOKEN_2 ??
    '';
  return raw.trim().replace(/^["']|["']$/g, '');
}

/**
 * Proxy for executive-dashboard APIs (AOP). Avoids browser CORS to akumaju.com.
 *
 * Browser: GET /api/executive-dashboard/payroll-associates/...
 * Server:   GET https://akumaju.com/ak-mj/api/v1/executive-dashboard/...
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const token = getAopApiToken();

  if (!token) {
    return NextResponse.json(
      { error: 'AM Main API token not configured (set AM_MAIN_API_URL_TOKEN_2 or NEXT_PUBLIC_AM_MAIN_API_URL_TOKEN_2)' },
      { status: 503 },
    );
  }

  const { path } = await params;
  if (!path?.length) {
    return NextResponse.json({ error: 'Path required' }, { status: 400 });
  }

  const segment = path.join('/');
  const search = request.nextUrl.searchParams.toString();
  const upstreamUrl = `${AOP_UPSTREAM_BASE}/api/v1/executive-dashboard/${segment}${search ? `?${search}` : ''}`;

  const headers: HeadersInit = {
    Accept: 'application/json',
    'X-API-Key': token,
  };

  try {
    const res = await fetch(upstreamUrl, { method: 'GET', headers, cache: 'no-store' });
    const bodyText = await res.text();
    const contentType = res.headers.get('content-type') ?? '';

    if (!contentType.includes('application/json')) {
      console.error('Executive dashboard proxy non-JSON response:', {
        upstreamUrl,
        status: res.status,
        contentType,
        bodyPreview: bodyText.slice(0, 200),
      });
      return NextResponse.json(
        {
          error: 'Upstream returned non-JSON response',
          upstream_status: res.status,
          upstream_url: upstreamUrl,
        },
        { status: 502 },
      );
    }

    const data = JSON.parse(bodyText) as unknown;
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Executive dashboard proxy GET error:', { upstreamUrl, err });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Proxy request failed', upstream_url: upstreamUrl },
      { status: 502 },
    );
  }
}
