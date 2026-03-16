import { NextRequest, NextResponse } from 'next/server';

const BASE = process.env.COLLECTION_API_URL ?? process.env.NEXT_PUBLIC_COLLECTION_API_URL ?? '';
const TOKEN = process.env.COLLECTION_API_TOKEN ?? process.env.NEXT_PUBLIC_COLLECTION_API_TOKEN ?? '';
const baseUrl = BASE.replace(/\/$/, '');

/**
 * Single proxy for all Collection API requests (avoids CORS).
 * - GET  /api/collection/temp_internal_payroll/monthly?start_month=...&end_month=...
 * - GET  /api/collection/temp_internal_payroll/paid_unpaid?...
 * - GET  /api/collection/temp_internal_payroll/receivable_risk?month=...&year=...
 * - GET  /api/collection/temp_internal_payroll/client_ranking?...
 * - POST /api/collection/api/dashboard/invoice_trend  (body: employer, product_type, customer_segment, month, year)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  if (!baseUrl) {
    return NextResponse.json({ error: 'Collection API URL not configured' }, { status: 503 });
  }
  const { path } = await params;
  if (!path?.length) {
    return NextResponse.json({ error: 'Path required' }, { status: 400 });
  }
  const segment = path.join('/');
  const search = request.nextUrl.searchParams.toString();
  const url = `${baseUrl}/${segment}${search ? `?${search}` : ''}`;
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (TOKEN) (headers as Record<string, string>)['Authorization'] = `Bearer ${TOKEN}`;
  try {
    const res = await fetch(url, { method: 'GET', headers });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Collection proxy GET error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Proxy request failed' },
      { status: 502 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  if (!baseUrl || !TOKEN) {
    return NextResponse.json(
      { error: 'Collection API not configured (URL and token required for POST)' },
      { status: 503 }
    );
  }
  const { path } = await params;
  if (!path?.length) {
    return NextResponse.json({ error: 'Path required' }, { status: 400 });
  }
  const segment = path.join('/');
  const url = `${baseUrl}/${segment}`;

  // invoice_trend expects FormData with token + form fields
  if (segment === 'api/dashboard/invoice_trend') {
    try {
      const body = await request.json();
      const form = new FormData();
      form.append('token', TOKEN);
      form.append('employer', body.employer ?? '0');
      form.append('product_type', body.product_type ?? '0');
      form.append('customer_segment', body.customer_segment ?? '0');
      form.append('month', body.month ?? '0');
      form.append('year', body.year ?? new Date().getFullYear().toString());
      const res = await fetch(url, { method: 'POST', body: form });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    } catch (err) {
      console.error('Collection proxy invoice_trend error:', err);
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Proxy request failed' },
        { status: 502 }
      );
    }
  }

  // other POST: forward body as JSON
  try {
    const body = await request.text();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (TOKEN) (headers as Record<string, string>)['Authorization'] = `Bearer ${TOKEN}`;
    const res = await fetch(url, { method: 'POST', headers, body: body || undefined });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Collection proxy POST error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Proxy request failed' },
      { status: 502 }
    );
  }
}
