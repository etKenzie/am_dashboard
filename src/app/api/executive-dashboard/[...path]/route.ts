import { NextRequest, NextResponse } from 'next/server';

const AOP_UPSTREAM_BASE = 'https://akumaju.com/ak-mj';

export const runtime = 'edge';
export const preferredRegion = ['sin1', 'hnd1', 'icn1', 'syd1'];

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
      {
        error: 'AOP API token not configured',
        hint: 'Set AM_MAIN_API_URL_TOKEN_2 (server) or NEXT_PUBLIC_AM_MAIN_API_URL_TOKEN_2 on Vercel, then redeploy',
      },
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

  console.log('[AOP proxy] upstream request', {
    method: 'GET',
    upstreamUrl,
    proxyPath: `/api/executive-dashboard/${segment}${search ? `?${search}` : ''}`,
    hasApiKey: Boolean(token),
    tokenLength: token.length,
  });

  const headers: HeadersInit = {
    Accept: 'application/json',
    'x-api-key': token,
    'User-Agent': 'Mozilla/5.0 (compatible; AMDashboard/1.0)',
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
          hint:
            res.status === 403
              ? 'akumaju.com is blocking Vercel server requests (403). Ask backend to whitelist Vercel IPs or enable CORS for executive-dashboard.akumaju.com on /api/v1/executive-dashboard/*'
              : undefined,
        },
        { status: 502 },
      );
    }

    const data = JSON.parse(bodyText) as unknown;
    console.log('[AOP proxy] upstream response', { upstreamUrl, status: res.status, ok: res.ok });
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Executive dashboard proxy GET error:', { upstreamUrl, err });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Proxy request failed', upstream_url: upstreamUrl },
      { status: 502 },
    );
  }
}
