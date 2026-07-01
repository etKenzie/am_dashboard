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
