'use client';

import { Box, FormControl, Grid, InputLabel, MenuItem, Select } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import type { LoanFilters as LoanFiltersType } from '../../api/loan/LoanSlice';
import { fetchLoanFilters } from '../../api/loan/LoanSlice';
import ClientScopeFilters from '../shared/ClientScopeFilters';

export interface KasbonOverviewFilterValues {
  month: string;
  year: string;
  employer: string;
  placement: string;
  project: string;
  branch: string;
  /** Empty array = all segments */
  clientSegments: string[];
  productType: string;
}

interface KasbonOverviewFiltersProps {
  filters: KasbonOverviewFilterValues;
  onFiltersChange: (filters: KasbonOverviewFilterValues) => void;
  loanType?: string;
}

const KasbonOverviewFilters = ({ filters, onFiltersChange, loanType }: KasbonOverviewFiltersProps) => {
  const [availableFilters, setAvailableFilters] = useState<LoanFiltersType | null>(null);
  const [loading, setLoading] = useState(false);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  useEffect(() => {
    setLoading(true);
    fetchLoanFilters(filters.employer || undefined, filters.placement || undefined, loanType)
      .then((response) => setAvailableFilters(response.filters))
      .catch((error) => console.error('Failed to fetch loan filters:', error))
      .finally(() => setLoading(false));
  }, [loanType, filters.employer, filters.placement]);

  const employerOptions = useMemo(
    () => [
      { value: '', label: 'All' },
      ...(availableFilters?.employers ?? []).map((employer) => ({
        value: employer,
        label: employer,
      })),
    ],
    [availableFilters?.employers],
  );

  const sourcedToOptions = useMemo(
    () => [
      { value: '', label: 'All' },
      ...(availableFilters?.placements ?? []).map((placement) => ({
        value: placement,
        label: placement,
      })),
    ],
    [availableFilters?.placements],
  );

  const projectOptions = useMemo(
    () => [
      { value: '', label: 'All' },
      ...(availableFilters?.projects ?? []).map((project) => ({
        value: project,
        label: project,
      })),
    ],
    [availableFilters?.projects],
  );

  const branchOptions = useMemo(
    () => [
      { value: '', label: 'All' },
      ...(availableFilters?.branches ?? []).map((branch) => ({
        value: branch,
        label: branch,
      })),
    ],
    [availableFilters?.branches],
  );

  const segmentOptions = useMemo(
    () =>
      (availableFilters?.client_segments ?? []).map((segment) => ({
        value: String(segment.option_id),
        label: segment.option_name.trim(),
      })),
    [availableFilters?.client_segments],
  );

  const productTypeOptions = useMemo(
    () => [
      { value: '', label: 'All' },
      ...(availableFilters?.product_types ?? []).map((type) => ({
        value: String(type.option_id),
        label: type.option_name.trim(),
      })),
    ],
    [availableFilters?.product_types],
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Grid container spacing={2} width="100%">
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Month</InputLabel>
            <Select
              value={filters.month}
              label="Month"
              onChange={(e) => onFiltersChange({ ...filters, month: e.target.value })}
              disabled={loading}
            >
              {months.map((month) => (
                <MenuItem key={month.value} value={month.value}>
                  {month.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Year</InputLabel>
            <Select
              value={filters.year}
              label="Year"
              onChange={(e) => onFiltersChange({ ...filters, year: e.target.value })}
              disabled={loading}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year.toString()}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <ClientScopeFilters
        allValue=""
        disabled={loading}
        values={{
          employer: filters.employer,
          sourcedTo: filters.placement,
          project: filters.project,
          branch: filters.branch,
          segments: filters.clientSegments,
          productType: filters.productType,
        }}
        options={{
          employers: employerOptions,
          sourcedTo: sourcedToOptions,
          projects: projectOptions,
          branches: branchOptions,
          segments: segmentOptions,
          productTypes: productTypeOptions,
        }}
        onChange={(next) =>
          onFiltersChange({
            ...filters,
            employer: next.employer,
            placement: next.sourcedTo,
            project: next.project,
            branch: next.branch,
            clientSegments: next.segments,
            productType: next.productType ?? filters.productType,
          })
        }
      />
    </Box>
  );
};

export default KasbonOverviewFilters;
