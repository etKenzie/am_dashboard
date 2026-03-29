/**
 * Temp Internal Payroll API
 * Calls Collection API directly at NEXT_PUBLIC_COLLECTION_API_URL.
 * Backend must allow CORS from your frontend origin (e.g. Access-Control-Allow-Origin: http://localhost:3000).
 */

import { COLLECTION_API_URL, COLLECTION_API_TOKEN } from '@/utils/config';

function authHeaders(): HeadersInit {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (COLLECTION_API_TOKEN) h['Authorization'] = `Bearer ${COLLECTION_API_TOKEN}`;
  return h;
}

/** Build FormData for dashboard endpoints (POST). */
function dashboardForm(params: TempInternalPayrollSummaryParams): FormData {
  const form = new FormData();
  form.append('token', COLLECTION_API_TOKEN);
  form.append('employer', params.employer ?? '0');
  form.append('product_type', params.product_type ?? '0');
  form.append('customer_segment', params.customer_segment ?? '0');
  form.append('month', params.month ?? '0');
  form.append('year', params.year ?? new Date().getFullYear().toString());
  return form;
}

/** FormData for client_by_* list endpoints (same filters + DataTables-style params + global search). */
function clientListForm(params: TempInternalPayrollSummaryParams, search?: string): FormData {
  const form = dashboardForm(params);
  form.append('draw', '1');
  form.append('start', '0');
  form.append('length', '100000');
  form.append('search[value]', (search ?? '').trim());
  return form;
}

/** Params for invoice_trend: requires start_period and end_period (MM-YYYY). */
export interface InvoiceTrendParams {
  start_period: string; // e.g. "10-2025"
  end_period: string;   // e.g. "03-2026"
  employer?: string;
  product_type?: string;
  customer_segment?: string;
}

/** Build FormData for invoice_trend (uses start_period/end_period). */
function invoiceTrendForm(params: InvoiceTrendParams): FormData {
  const form = new FormData();
  form.append('token', COLLECTION_API_TOKEN);
  form.append('employer', params.employer ?? '0');
  form.append('product_type', params.product_type ?? '0');
  form.append('customer_segment', params.customer_segment ?? '0');
  form.append('start_period', params.start_period);
  form.append('end_period', params.end_period);
  return form;
}

export interface TempInternalPayrollSummaryParams {
  month?: string;
  year?: string;
  employer?: string;       // 0 => All, 1 => PT Valdo International, 2 => PT Valdo Sumber Daya Mandiri, 94 => PT Toko Pandai
  product_type?: string;    // 0 => All, 1 => BPO Bundling, 2 => People, 3 => Infra & Technology, 4 => AkuMaju
  customer_segment?: string; // 0 => All, 1-9 => see Postman collection
}

export interface TempInternalPayrollSummaryResponse {
  status: string;
  total_nilai_invoice_released: number;
  total_invoice_paid: number;
  total_outstanding_invoice: number;
  total_overview_invoice: number;
  jumlah_invoice: number;
  collection_rate: number; // 0-100
  average_days_to_payment: number;
  on_time_payment_rate: number; // 0-100
  message?: string | null;
}

function parseNum(v: string | number): number {
  if (typeof v === 'number') return v;
  const n = parseFloat(String(v).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function parseCollectionRate(s: string): number {
  const n = parseFloat(String(s).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

/** {{base_url}}/api/dashboard/financial_summary */
async function fetchFinancialSummary(
  params: TempInternalPayrollSummaryParams
): Promise<TempInternalPayrollSummaryResponse> {
  const res = await fetch(`${COLLECTION_API_URL}/api/dashboard/financial_summary`, {
    method: 'POST',
    body: dashboardForm(params),
  });
  if (!res.ok) throw new Error(`financial_summary: ${res.status}`);
  const json = await res.json();
  if (json.error || !json.result) throw new Error(json.msg || 'financial_summary error');
  const r = json.result;
  return {
    status: 'ok',
    total_nilai_invoice_released: parseNum(r.invoice_released.jumlah),
    total_invoice_paid: parseNum(r.invoice_paid.jumlah),
    total_outstanding_invoice: parseNum(r.total_outstanding.jumlah),
    total_overview_invoice: parseNum(r.total_overdue.jumlah),
    jumlah_invoice: r.invoice_released?.total_invoices ?? 0,
    collection_rate: parseCollectionRate(r.collection_rate),
    average_days_to_payment: 0,
    on_time_payment_rate: 0,
  };
}

/** {{base_url}}/api/dashboard/payment_performance */
async function fetchPaymentPerformance(params: TempInternalPayrollSummaryParams): Promise<{
  average_days: number;
  percentage_payment: number;
}> {
  const res = await fetch(`${COLLECTION_API_URL}/api/dashboard/payment_performance`, {
    method: 'POST',
    body: dashboardForm(params),
  });
  if (!res.ok) throw new Error(`payment_performance: ${res.status}`);
  const json = await res.json();
  if (json.error || !json.result) throw new Error(json.msg || 'payment_performance error');
  const r = json.result;
  const avgStr = String(r.avarage_payment ?? r.average_payment ?? '0').replace(/[^0-9.-]/g, '');
  const pctStr = String(r.percentage_payment ?? '0').replace(/[^0-9.]/g, '');
  return {
    average_days: Number.isFinite(Number(avgStr)) ? Number(avgStr) : 0,
    percentage_payment: Number.isFinite(Number(pctStr)) ? Number(pctStr) : 0,
  };
}

/**
 * Fetch temp internal payroll summary from financial_summary + payment_performance.
 */
export const fetchTempInternalPayrollSummary = async (
  params: TempInternalPayrollSummaryParams
): Promise<TempInternalPayrollSummaryResponse> => {
  if (!params.month && !params.year) throw new Error('Month and year required');
  const [financial, payment] = await Promise.all([
    fetchFinancialSummary(params),
    fetchPaymentPerformance(params).catch(() => ({ average_days: 0, percentage_payment: 0 })),
  ]);
  return {
    ...financial,
    average_days_to_payment: payment.average_days,
    on_time_payment_rate: payment.percentage_payment,
  };
};

/** Monthly data point for chart (key = "Month YYYY" e.g. "March 2025") */
export interface TempInternalPayrollMonthlySummary {
  nilai_invoice: number;
  jumlah_invoice: number;
}

export interface TempInternalPayrollMonthlyResponse {
  status: string;
  summaries: Record<string, TempInternalPayrollMonthlySummary>;
  message?: string | null;
}

export interface TempInternalPayrollMonthlyParams {
  start_month: string; // "MM-YYYY"
  end_month: string;   // "MM-YYYY"
  employer?: string;
  product_type?: string;
  customer_segment?: string;
}

/**
 * {{base_url}}/api/dashboard/invoice_trend
 * - get_tren_nilai + get_tren_jumlah_invoice → Nilai Invoice & Jumlah Invoice line chart
 * - get_tren_performa_pembayaran (data_paid, data_unpaid) → Paid vs Unpaid stacked column chart
 */
export interface InvoiceTrendResult {
  get_tren_nilai: { label: string[]; data: number[] };
  get_tren_jumlah_invoice: { label: string[]; data: number[] };
  get_tren_performa_pembayaran: {
    label: string[];
    data_paid: number[];
    data_unpaid: number[];
  };
}

export async function fetchInvoiceTrendRaw(
  params: InvoiceTrendParams
): Promise<InvoiceTrendResult> {
  const url = `${COLLECTION_API_URL}/api/dashboard/invoice_trend`;
  const body = invoiceTrendForm(params);
  const requestInfo = { url, params: { ...params } };
  console.log('[invoice_trend] request', requestInfo);
  const res = await fetch(url, { method: 'POST', body });
  const json = await res.json();
  console.log('[invoice_trend] response', { ok: res.ok, status: res.status, json });
  if (!res.ok) throw new Error(`invoice_trend: ${res.status}`);
  if (json.error || !json.result) throw new Error(json.msg || 'invoice_trend error');
  return json.result;
}

/**
 * Fetch temp internal payroll monthly from invoice_trend (get_tren_nilai + get_tren_jumlah_invoice).
 * Returns empty summaries when API is unavailable.
 */
export const fetchTempInternalPayrollMonthly = async (
  params: TempInternalPayrollMonthlyParams
): Promise<TempInternalPayrollMonthlyResponse> => {
  if (!COLLECTION_API_URL) return { status: 'ok', summaries: {} };
  try {
    const trendParams: InvoiceTrendParams = {
      start_period: params.start_month,
      end_period: params.end_month,
      employer: params.employer ?? '0',
      product_type: params.product_type ?? '0',
      customer_segment: params.customer_segment ?? '0',
    };
    const result = await fetchInvoiceTrendRaw(trendParams);
    const labels = result.get_tren_nilai?.label ?? [];
    const nilai = result.get_tren_nilai?.data ?? [];
    const jumlah = result.get_tren_jumlah_invoice?.data ?? [];
    const summaries: Record<string, TempInternalPayrollMonthlySummary> = {};
    labels.forEach((label, i) => {
      summaries[label] = {
        nilai_invoice: nilai[i] ?? 0,
        jumlah_invoice: jumlah[i] ?? 0,
      };
    });
    return { status: 'ok', summaries };
  } catch (e) {
    console.warn('[fetchTempInternalPayrollMonthly] error', e);
    return { status: 'ok', summaries: {} };
  }
};

/** Monthly paid/unpaid for stacked column chart (key = "Month YYYY") */
export interface TempInternalPayrollPaidUnpaidSummary {
  paid: number;
  unpaid: number;
}

export interface TempInternalPayrollPaidUnpaidResponse {
  status: string;
  summaries: Record<string, TempInternalPayrollPaidUnpaidSummary>;
  message?: string | null;
}

export interface TempInternalPayrollPaidUnpaidParams {
  start_month: string;
  end_month: string;
  employer?: string;
  product_type?: string;
  customer_segment?: string;
}

/**
 * Fetch paid/unpaid from invoice_trend (get_tren_performa_pembayaran).
 * Returns empty summaries when API is unavailable.
 */
export const fetchTempInternalPayrollPaidUnpaid = async (
  params: TempInternalPayrollPaidUnpaidParams
): Promise<TempInternalPayrollPaidUnpaidResponse> => {
  if (!COLLECTION_API_URL) return { status: 'ok', summaries: {} };
  try {
    const trendParams: InvoiceTrendParams = {
      start_period: params.start_month,
      end_period: params.end_month,
      employer: params.employer ?? '0',
      product_type: params.product_type ?? '0',
      customer_segment: params.customer_segment ?? '0',
    };
    const result = await fetchInvoiceTrendRaw(trendParams);
    const perf = result.get_tren_performa_pembayaran;
    const labels = perf?.label ?? [];
    const paid = perf?.data_paid ?? [];
    const unpaid = perf?.data_unpaid ?? [];
    const summaries: Record<string, TempInternalPayrollPaidUnpaidSummary> = {};
    labels.forEach((label, i) => {
      summaries[label] = { paid: paid[i] ?? 0, unpaid: unpaid[i] ?? 0 };
    });
    return { status: 'ok', summaries };
  } catch (e) {
    console.warn('[fetchTempInternalPayrollPaidUnpaid] error', e);
    return { status: 'ok', summaries: {} };
  }
};

/** Receivable risk aging buckets: current (not overdue) + overdue day ranges */
export const RECEIVABLE_RISK_BUCKETS = [
  'current',
  '0-30',
  '31-60',
  '61-90',
  '91-120',
  '121-180',
  '181-365',
] as const;

export type ReceivableRiskBucketKey = (typeof RECEIVABLE_RISK_BUCKETS)[number];

export interface TempInternalPayrollReceivableRiskResponse {
  status: string;
  month: string;
  year: string;
  /** Total invoice amount per bucket key (e.g. "0-30", "31-60", ...) */
  buckets: Record<string, number>;
  message?: string | null;
}

export interface TempInternalPayrollReceivableRiskParams {
  month: string;
  year: string;
  employer?: string;
  product_type?: string;
  customer_segment?: string;
}

function emptyReceivableRisk(month: string, year: string): TempInternalPayrollReceivableRiskResponse {
  const buckets: Record<string, number> = {};
  RECEIVABLE_RISK_BUCKETS.forEach((k) => {
    buckets[k] = 0;
  });
  return { status: 'ok', month, year, buckets };
}

/** {{base_url}}/api/dashboard/ar_management — label + data arrays */
const AR_LABEL_TO_BUCKET: Record<string, string> = {
  current: 'current',
  bucket_1_30: '0-30',
  bucket_31_60: '31-60',
  bucket_61_90: '61-90',
  bucket_91_120: '91-120',
  bucket_121_180: '121-180',
  bucket_181_365: '181-365',
  bucket_over_365: '181-365',
};

/**
 * Fetch receivable risk from ar_management.
 */
export const fetchTempInternalPayrollReceivableRisk = async (
  params: TempInternalPayrollReceivableRiskParams
): Promise<TempInternalPayrollReceivableRiskResponse> => {
  if (!COLLECTION_API_URL) return emptyReceivableRisk(params.month, params.year);
  try {
    const dashboardParams: TempInternalPayrollSummaryParams = {
      month: params.month,
      year: params.year,
      employer: params.employer ?? '0',
      product_type: params.product_type ?? '0',
      customer_segment: params.customer_segment ?? '0',
    };
    const res = await fetch(`${COLLECTION_API_URL}/api/dashboard/ar_management`, {
      method: 'POST',
      body: dashboardForm(dashboardParams),
    });
    if (!res.ok) return emptyReceivableRisk(params.month, params.year);
    const json = await res.json();
    if (json.error || !json.result) return emptyReceivableRisk(params.month, params.year);
    const labels: string[] = json.result.label ?? [];
    const data: number[] = json.result.data ?? [];
    const buckets: Record<string, number> = {};
    RECEIVABLE_RISK_BUCKETS.forEach((k) => {
      buckets[k] = 0;
    });
    labels.forEach((label, i) => {
      const key = AR_LABEL_TO_BUCKET[label] ?? label;
      if (RECEIVABLE_RISK_BUCKETS.includes(key as any)) {
        buckets[key] = (buckets[key] ?? 0) + (data[i] ?? 0);
      } else if (key === '181-365') {
        buckets['181-365'] = (buckets['181-365'] ?? 0) + (data[i] ?? 0);
      }
    });
    return { status: 'ok', month: params.month, year: params.year, buckets };
  } catch {
    return emptyReceivableRisk(params.month, params.year);
  }
};

/** Client ranking row for temp internal payroll (by invoice, outstanding, overdue) */
export interface TempInternalPayrollClientRankingRow {
  sourced_to: string;
  project?: string;
  total_invoice: number;
  outstanding_invoice: number;
  overdue_invoice: number;
}

export interface TempInternalPayrollClientRankingResponse {
  status: string;
  count?: number;
  results: TempInternalPayrollClientRankingRow[];
  message?: string | null;
}

export interface TempInternalPayrollClientRankingParams {
  month?: string;
  year?: string;
  employer?: string;
  product_type?: string;
  customer_segment?: string;
  /** Sent as FormData field `search[value]` (DataTables global search). */
  searchInvoice?: string;
  searchOutstanding?: string;
  searchOverdue?: string;
}

/**
 * Row shape for {{base_url}}/api/dashboard/client_by_invoice (and sibling client_by_* list APIs).
 * Response: { error, msg, draw, recordsTotal, recordsFiltered, data: [...] }
 */
interface ClientByListApiRow {
  client?: string | null;
  project?: string | null;
  ranking?: string;
  total_invoices?: string;
  total_outstandings?: string;
  total_outstanding?: string;
  total_overdue?: string;
}

function sourcedToFromClientRow(x: ClientByListApiRow): string {
  const c = (x.client ?? '').trim();
  const p = (x.project ?? '').trim();
  if (c && p) return `${c} — ${p}`;
  return c || p || '—';
}

async function fetchClientByListEndpoint(
  pathSegment: string,
  params: TempInternalPayrollClientRankingParams,
  search?: string
): Promise<ClientByListApiRow[]> {
  if (!COLLECTION_API_URL) return [];
  const dashboardParams: TempInternalPayrollSummaryParams = {
    month: params.month,
    year: params.year,
    employer: params.employer ?? '0',
    product_type: params.product_type ?? '0',
    customer_segment: params.customer_segment ?? '0',
  };
  try {
    const res = await fetch(`${COLLECTION_API_URL}/api/dashboard/${pathSegment}`, {
      method: 'POST',
      body: clientListForm(dashboardParams, search),
    });
    if (!res.ok) return [];
    const json = await res.json();
    if (json.error) return [];
    const data = json.data;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function mapClientByInvoiceRows(rows: ClientByListApiRow[]): TempInternalPayrollClientRankingRow[] {
  return rows.map((x) => ({
    sourced_to: sourcedToFromClientRow(x),
    project: x.project ?? undefined,
    total_invoice: parseNum(x.total_invoices ?? 0),
    outstanding_invoice: 0,
    overdue_invoice: 0,
  }));
}

function mapClientByOutstandingRows(rows: ClientByListApiRow[]): TempInternalPayrollClientRankingRow[] {
  return rows.map((x) => ({
    sourced_to: sourcedToFromClientRow(x),
    project: x.project ?? undefined,
    total_invoice: 0,
    outstanding_invoice: parseNum(x.total_outstandings ?? x.total_outstanding ?? x.total_invoices ?? 0),
    overdue_invoice: 0,
  }));
}

function mapClientByOverdueRows(rows: ClientByListApiRow[]): TempInternalPayrollClientRankingRow[] {
  return rows.map((x) => ({
    sourced_to: sourcedToFromClientRow(x),
    project: x.project ?? undefined,
    total_invoice: 0,
    outstanding_invoice: 0,
    overdue_invoice: parseNum(x.total_overdue ?? x.total_invoices ?? 0),
  }));
}

/** {{base_url}}/api/dashboard/client_by_invoice | client_by_outstanding | client_by_overdue */
const CLIENT_BY_INVOICE = 'client_by_invoice';
const CLIENT_BY_OUTSTANDING = 'client_by_outstanding';
const CLIENT_BY_OVERDUE = 'client_by_overdue';

function rankingParamsFromFilters(filters: TempInternalPayrollSummaryParams): TempInternalPayrollClientRankingParams {
  return {
    month: filters.month,
    year: filters.year,
    employer: filters.employer ?? '0',
    product_type: filters.product_type ?? '0',
    customer_segment: filters.customer_segment ?? '0',
  };
}

/** Single client_by_invoice request (for isolated table refresh). */
export async function fetchClientInvoiceTable(
  filters: TempInternalPayrollSummaryParams,
  search?: string
): Promise<TempInternalPayrollClientRankingRow[]> {
  if (!COLLECTION_API_URL) return [];
  const rows = await fetchClientByListEndpoint(CLIENT_BY_INVOICE, rankingParamsFromFilters(filters), search);
  return mapClientByInvoiceRows(rows);
}

/** Single client_by_outstanding request. */
export async function fetchClientOutstandingTable(
  filters: TempInternalPayrollSummaryParams,
  search?: string
): Promise<TempInternalPayrollClientRankingRow[]> {
  if (!COLLECTION_API_URL) return [];
  const rows = await fetchClientByListEndpoint(CLIENT_BY_OUTSTANDING, rankingParamsFromFilters(filters), search);
  return mapClientByOutstandingRows(rows);
}

/** Single client_by_overdue request. */
export async function fetchClientOverdueTable(
  filters: TempInternalPayrollSummaryParams,
  search?: string
): Promise<TempInternalPayrollClientRankingRow[]> {
  if (!COLLECTION_API_URL) return [];
  const rows = await fetchClientByListEndpoint(CLIENT_BY_OVERDUE, rankingParamsFromFilters(filters), search);
  return mapClientByOverdueRows(rows);
}

export interface CustomerInsightResponse {
  byInvoice: TempInternalPayrollClientRankingRow[];
  byOutstanding: TempInternalPayrollClientRankingRow[];
  byOverdue: TempInternalPayrollClientRankingRow[];
}

/**
 * Fetch client ranking (merged) from separate client_by_* list endpoints.
 */
export const fetchTempInternalPayrollClientRanking = async (
  params: TempInternalPayrollClientRankingParams
): Promise<TempInternalPayrollClientRankingResponse> => {
  if (!COLLECTION_API_URL) {
    return { status: 'ok', results: [] };
  }
  const [invoiceRows, outstandingRows, overdueRows] = await Promise.all([
    fetchClientByListEndpoint(CLIENT_BY_INVOICE, params, params.searchInvoice),
    fetchClientByListEndpoint(CLIENT_BY_OUTSTANDING, params, params.searchOutstanding),
    fetchClientByListEndpoint(CLIENT_BY_OVERDUE, params, params.searchOverdue),
  ]);
  const byInvoice = mapClientByInvoiceRows(invoiceRows);
  const byOutstanding = mapClientByOutstandingRows(outstandingRows);
  const byOverdue = mapClientByOverdueRows(overdueRows);

  const merged = new Map<string, TempInternalPayrollClientRankingRow>();
  [...byInvoice, ...byOutstanding, ...byOverdue].forEach((row) => {
    const key = row.sourced_to;
    const existing = merged.get(key);
    if (!existing) merged.set(key, { ...row });
    else
      merged.set(key, {
        sourced_to: row.sourced_to,
        total_invoice: existing.total_invoice + row.total_invoice,
        outstanding_invoice: existing.outstanding_invoice + row.outstanding_invoice,
        overdue_invoice: existing.overdue_invoice + row.overdue_invoice,
      });
  });
  return {
    status: 'ok',
    results: Array.from(merged.values()),
  };
};

/**
 * Fetch three client tables: client_by_invoice, client_by_outstanding, client_by_overdue.
 */
export const fetchCustomerInsight = async (
  params: TempInternalPayrollClientRankingParams
): Promise<CustomerInsightResponse> => {
  if (!COLLECTION_API_URL) {
    return { byInvoice: [], byOutstanding: [], byOverdue: [] };
  }
  const filters: TempInternalPayrollSummaryParams = {
    month: params.month,
    year: params.year,
    employer: params.employer,
    product_type: params.product_type,
    customer_segment: params.customer_segment,
  };
  const [byInvoice, byOutstanding, byOverdue] = await Promise.all([
    fetchClientInvoiceTable(filters, params.searchInvoice),
    fetchClientOutstandingTable(filters, params.searchOutstanding),
    fetchClientOverdueTable(filters, params.searchOverdue),
  ]);
  return { byInvoice, byOutstanding, byOverdue };
};
