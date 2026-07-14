import type { LoanDateMode } from '../kasbon/KasbonFilters';

/** Max bars on a headcount breakdown chart, including the aggregated "Other" bar. */
export const AOP_HEADCOUNT_TOP_N = 12;

export type AopHeadcountCategory = {
  label: string;
  value: number;
};

export type AopTopNHeadcountSplit = {
  chartItems: AopHeadcountCategory[];
  otherItems: AopHeadcountCategory[];
  otherTotal: number;
};

/**
 * Keep the largest categories on the chart; fold the long tail into one "Other" bar
 * and return the detail rows for an expandable list/table.
 */
export function splitTopNHeadcount(
  items: AopHeadcountCategory[],
  topN: number = AOP_HEADCOUNT_TOP_N,
): AopTopNHeadcountSplit {
  const sorted = [...items].sort((a, b) => b.value - a.value);

  if (sorted.length <= topN) {
    return { chartItems: sorted, otherItems: [], otherTotal: 0 };
  }

  const namedCount = Math.max(1, topN - 1);
  const named = sorted.slice(0, namedCount);
  const otherItems = sorted.slice(namedCount);
  const otherTotal = otherItems.reduce((sum, row) => sum + row.value, 0);

  return {
    chartItems: [
      ...named,
      {
        label: 'Other',
        value: otherTotal,
      },
    ],
    otherItems,
    otherTotal,
  };
}

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
