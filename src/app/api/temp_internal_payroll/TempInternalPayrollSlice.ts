/**
 * Temp Internal Payroll API
 * Types and fetch functions for the new internal payroll overview.
 * Replace endpoint paths when backend is ready.
 */

import { AM_API_URL } from '@/utils/config';

export interface TempInternalPayrollSummaryParams {
  month?: string;
  year?: string;
}

export interface TempInternalPayrollSummaryResponse {
  status: string;
  total_nilai_invoice_released: number;
  total_invoice_paid: number;
  total_outstanding_invoice: number;
  total_overview_invoice: number;
  jumlah_invoice: number;
  collection_rate: number; // 0-100 or 0-1, we'll support both
  average_days_to_payment: number;
  on_time_payment_rate: number; // 0-100 or 0-1
  message?: string | null;
}

/**
 * Fetch temp internal payroll summary (all 6 metrics).
 * Backend can expose a single summary endpoint or we can add separate endpoints per metric.
 */
export const fetchTempInternalPayrollSummary = async (
  params: TempInternalPayrollSummaryParams
): Promise<TempInternalPayrollSummaryResponse> => {
  const baseUrl = AM_API_URL;
  const queryParams = new URLSearchParams();
  if (params.month) queryParams.append('month', params.month);
  if (params.year) queryParams.append('year', params.year);
  const url = `${baseUrl}/temp_internal_payroll/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  console.log('🔗 API Request:', { endpoint: 'fetchTempInternalPayrollSummary', fullUrl: url, params });

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch temp internal payroll summary: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  // Normalize collection_rate to 0-100 if backend sends 0-1
  if (typeof data.collection_rate === 'number' && data.collection_rate <= 1 && data.collection_rate >= 0) {
    data.collection_rate = data.collection_rate * 100;
  }
  if (typeof data.on_time_payment_rate === 'number' && data.on_time_payment_rate <= 1 && data.on_time_payment_rate >= 0) {
    data.on_time_payment_rate = data.on_time_payment_rate * 100;
  }
  return data;
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
}

/**
 * Fetch temp internal payroll monthly series for Nilai Invoice and Jumlah Invoice.
 */
export const fetchTempInternalPayrollMonthly = async (
  params: TempInternalPayrollMonthlyParams
): Promise<TempInternalPayrollMonthlyResponse> => {
  const baseUrl = AM_API_URL;
  const queryParams = new URLSearchParams();
  queryParams.append('start_month', params.start_month);
  queryParams.append('end_month', params.end_month);
  const url = `${baseUrl}/temp_internal_payroll/monthly?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch temp internal payroll monthly: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
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
}

/**
 * Fetch temp internal payroll monthly paid vs unpaid for Invoice Trends chart.
 */
export const fetchTempInternalPayrollPaidUnpaid = async (
  params: TempInternalPayrollPaidUnpaidParams
): Promise<TempInternalPayrollPaidUnpaidResponse> => {
  const baseUrl = AM_API_URL;
  const queryParams = new URLSearchParams();
  queryParams.append('start_month', params.start_month);
  queryParams.append('end_month', params.end_month);
  const url = `${baseUrl}/temp_internal_payroll/paid_unpaid?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch temp internal payroll paid/unpaid: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

/** Receivable risk aging buckets (days) */
export const RECEIVABLE_RISK_BUCKETS = [
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
}

/**
 * Fetch receivable risk (total invoice by aging bucket) for a given month.
 */
export const fetchTempInternalPayrollReceivableRisk = async (
  params: TempInternalPayrollReceivableRiskParams
): Promise<TempInternalPayrollReceivableRiskResponse> => {
  const baseUrl = AM_API_URL;
  const queryParams = new URLSearchParams();
  queryParams.append('month', params.month);
  queryParams.append('year', params.year);
  const url = `${baseUrl}/temp_internal_payroll/receivable_risk?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch receivable risk: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
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
}

/**
 * Fetch client ranking data (invoice, outstanding, overdue) for tables.
 */
export const fetchTempInternalPayrollClientRanking = async (
  params: TempInternalPayrollClientRankingParams
): Promise<TempInternalPayrollClientRankingResponse> => {
  const baseUrl = AM_API_URL;
  const queryParams = new URLSearchParams();
  if (params.month) queryParams.append('month', params.month);
  if (params.year) queryParams.append('year', params.year);
  const url = `${baseUrl}/temp_internal_payroll/client_ranking${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch client ranking: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};
