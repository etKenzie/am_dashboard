import { NextRequest, NextResponse } from 'next/server';

const BASE =
  process.env.AM_MAIN_API_URL ??
  process.env.NEXT_PUBLIC_AM_MAIN_API_URL ??
  '';
const TOKEN =
  process.env.AM_MAIN_API_URL_TOKEN_2 ??
  process.env.NEXT_PUBLIC_AM_MAIN_API_URL_TOKEN_2 ??
  '';
const baseUrl = BASE.replace(/\/$/, '');

/**
 * Proxy for executive-dashboard APIs (AOP). Avoids browser CORS to akumaju.com.
 * GET /api/executive-dashboard/payroll-associates/summary?...
 * GET /api/executive-dashboard/payroll-associates/filter-options?...
 * Additional segments (trend, by-branch, …) are proxied the same way when added.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  if (!baseUrl) {
    return NextResponse.json({ error: 'AM Main API URL not configured' }, { status: 503 });
  }
  if (!TOKEN) {
    return NextResponse.json({ error: 'AM Main API token (_TOKEN_2) not configured' }, { status: 503 });
  }

  const { path } = await params;
  if (!path?.length) {
    return NextResponse.json({ error: 'Path required' }, { status: 400 });
  }

  const segment = path.join('/');
  const search = request.nextUrl.searchParams.toString();
  const url = `${baseUrl}/api/v1/executive-dashboard/${segment}${search ? `?${search}` : ''}`;

  const headers: HeadersInit = {
    Accept: 'application/json',
    'X-API-Key': TOKEN,
  };

  try {
    const res = await fetch(url, { method: 'GET', headers, cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Executive dashboard proxy GET error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Proxy request failed' },
      { status: 502 },
    );
  }
}
