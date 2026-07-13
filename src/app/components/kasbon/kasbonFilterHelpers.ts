import type { KasbonFilterValues } from './KasbonFilters';

export function areKasbonFiltersEqual(a: KasbonFilterValues, b: KasbonFilterValues): boolean {
  return (
    a.dateMode === b.dateMode
    && a.month === b.month
    && a.year === b.year
    && a.startDate === b.startDate
    && a.endDate === b.endDate
    && a.employer === b.employer
    && a.placement === b.placement
    && a.project === b.project
    && a.branch === b.branch
    && a.productType === b.productType
    && JSON.stringify(a.clientSegments) === JSON.stringify(b.clientSegments)
  );
}
