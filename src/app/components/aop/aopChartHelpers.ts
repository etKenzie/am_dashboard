import type { LoanDateMode } from '../kasbon/KasbonFilters';

export function isAopCurrentYearMonthMode(dateMode: LoanDateMode, year: string): boolean {
  return dateMode === 'month' && year === String(new Date().getFullYear());
}

export function trimTrailingZeroPoints(
  categories: string[],
  values: number[],
): { categories: string[]; values: number[] } {
  let end = values.length;
  while (end > 0 && values[end - 1] === 0) {
    end -= 1;
  }
  return {
    categories: categories.slice(0, end),
    values: values.slice(0, end),
  };
}

export function trimTrailingZeroTrend<T extends { values: number[] }>(
  categories: string[],
  values: number[],
  employerSeries?: T[],
): { categories: string[]; values: number[]; employerSeries: T[] } {
  let end = values.length;
  while (end > 0 && values[end - 1] === 0) {
    end -= 1;
  }
  return {
    categories: categories.slice(0, end),
    values: values.slice(0, end),
    employerSeries: (employerSeries ?? []).map((series) => ({
      ...series,
      values: series.values.slice(0, end),
    })),
  };
}

function lastNonZeroIndex(values: number[]): number {
  let end = values.length;
  while (end > 0 && values[end - 1] === 0) {
    end -= 1;
  }
  return end;
}

/** Shared x-axis length across metrics so Apex can animate series-only updates. */
export function getStableTrendCategories(
  categories: string[],
  seriesByMetric: Record<string, number[]>,
  metricKeys: string[],
): string[] {
  if (metricKeys.length === 0) return categories;

  let stableEnd = 0;
  for (const key of metricKeys) {
    stableEnd = Math.max(stableEnd, lastNonZeroIndex(seriesByMetric[key] ?? []));
  }

  return stableEnd > 0 ? categories.slice(0, stableEnd) : categories;
}

/** Trim trailing zeros, then pad with null so every metric shares the same category count. */
export function alignTrendValuesToCategories(
  values: number[],
  categoryCount: number,
): (number | null)[] {
  const end = lastNonZeroIndex(values);
  const aligned: (number | null)[] = values.slice(0, end);
  while (aligned.length < categoryCount) {
    aligned.push(null);
  }
  return aligned.slice(0, categoryCount);
}
