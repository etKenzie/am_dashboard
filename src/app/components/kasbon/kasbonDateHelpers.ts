import type { KasbonFilterValues } from './KasbonFilters';
export type { LoanDateMode } from './KasbonFilters';
import type { LoanDateMode } from './KasbonFilters';

export interface LoanTrendChartFilters {
  employer: string;
  placement: string;
  project: string;
  clientSegments?: string[];
  productType?: string;
  loanType: string;
  dateMode: LoanDateMode;
  month?: string;
  year?: string;
  startDate?: string;
  endDate?: string;
}

export type LoanDateFilterInputs = {
  dateMode: LoanDateMode;
  month?: string;
  year?: string;
  startDate?: string;
  endDate?: string;
};

export function formatLoanDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLoanDateString(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

export function getMonthDateRange(month: string, year: string): { startDate: string; endDate: string } | null {
  if (!month || !year) return null;

  const y = parseInt(year, 10);
  const m = parseInt(month, 10) - 1;
  if (Number.isNaN(y) || Number.isNaN(m) || m < 0 || m > 11) return null;

  return {
    startDate: formatLoanDate(new Date(y, m, 1)),
    endDate: formatLoanDate(new Date(y, m + 1, 0)),
  };
}

export function kasbonDateParams(filters: LoanDateFilterInputs): {
  start_date?: string;
  end_date?: string;
} {
  if (filters.dateMode === 'range') {
    return {
      start_date: filters.startDate || undefined,
      end_date: filters.endDate || undefined,
    };
  }

  const range = getMonthDateRange(filters.month ?? '', filters.year ?? '');
  if (!range) return {};

  return {
    start_date: range.startDate,
    end_date: range.endDate,
  };
}

export function isKasbonDateFilterReady(filters: LoanDateFilterInputs): boolean {
  if (filters.dateMode === 'range') {
    return Boolean(filters.startDate && filters.endDate);
  }
  return Boolean(filters.month && filters.year);
}

export function getLoanChartDateBounds(
  filters: LoanDateFilterInputs,
  chartYear?: string,
): { startDate: string; endDate: string } | null {
  if (filters.dateMode === 'range') {
    if (!filters.startDate || !filters.endDate) return null;
    return { startDate: filters.startDate, endDate: filters.endDate };
  }

  const year = chartYear || filters.year;
  if (!year) return null;

  return {
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`,
  };
}

export function getYearToDateRange(referenceDate = new Date()): { startDate: string; endDate: string } {
  const year = referenceDate.getFullYear();
  return {
    startDate: `${year}-01-01`,
    endDate: formatLoanDate(referenceDate),
  };
}

export function applyLoanDateModeChange(
  filters: KasbonFilterValues,
  dateMode: LoanDateMode,
): KasbonFilterValues {
  if (dateMode === 'range') {
    return { ...filters, dateMode, ...getYearToDateRange() };
  }
  return { ...filters, dateMode };
}

export function getDefaultKasbonFilterDates(): Pick<
  KasbonFilterValues,
  'dateMode' | 'month' | 'year' | 'startDate' | 'endDate'
> {
  const currentDate = new Date();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const currentYear = currentDate.getFullYear().toString();
  const { startDate, endDate } = getYearToDateRange(currentDate);

  return {
    dateMode: 'month' as LoanDateMode,
    month: currentMonth,
    year: currentYear,
    startDate,
    endDate,
  };
}

export function formatKasbonDateLabel(filters: LoanDateFilterInputs): string {
  if (filters.dateMode === 'range') {
    return `${filters.startDate} – ${filters.endDate}`;
  }
  return `${filters.month}/${filters.year}`;
}
