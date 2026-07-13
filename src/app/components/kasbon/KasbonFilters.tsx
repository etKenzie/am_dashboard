'use client';

import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useEffect, useMemo, useState } from 'react';
import type { LoanFilters as LoanFiltersType } from '../../api/loan/LoanSlice';
import { fetchLoanFilters } from '../../api/loan/LoanSlice';
import ClientScopeFilters from '../shared/ClientScopeFilters';
import { formatLoanDate, parseLoanDateString } from './kasbonDateHelpers';

export type LoanTypeValue = 'all' | 'kasbon' | 'extradana' | 'aku_cicil';
export type LoanDateMode = 'month' | 'range';

export interface KasbonFilterValues {
  dateMode: LoanDateMode;
  month: string;
  year: string;
  startDate: string;
  endDate: string;
  employer: string;
  placement: string;
  project: string;
  branch: string;
  /** Empty array = all segments */
  clientSegments: string[];
  productType: string;
}

const CLIENT_SEGMENT_API_IDS: Record<string, string> = {
  bfsi_all: 'all_bfsi',
  non_bfsi_all: 'all_non_bfsi',
};

export function normalizeClientSegmentId(id: string): string {
  return CLIENT_SEGMENT_API_IDS[id] ?? id;
}

export function formatClientSegmentParam(segments?: string[]): string | undefined {
  const ids = (segments ?? [])
    .filter((id) => id && id !== '0')
    .map(normalizeClientSegmentId);
  return ids.length > 0 ? ids.join(',') : undefined;
}

interface LoanDateModeToggleProps {
  value: LoanDateMode;
  onChange: (mode: LoanDateMode) => void;
}

export function LoanDateModeToggle({ value, onChange }: LoanDateModeToggleProps) {
  return (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={value}
      onChange={(_, next) => {
        if (next) onChange(next);
      }}
    >
      <ToggleButton value="month">Month</ToggleButton>
      <ToggleButton value="range">Date Range</ToggleButton>
    </ToggleButtonGroup>
  );
}

export function kasbonScopedLoanParams(filters: KasbonFilterValues) {
  return {
    employer: filters.employer || undefined,
    sourced_to: filters.placement || undefined,
    project: filters.project || undefined,
    branch: filters.branch || undefined,
    client_segment: formatClientSegmentParam(filters.clientSegments),
    product_type: filters.productType || undefined,
  };
}

interface KasbonFiltersProps {
  filters: KasbonFilterValues;
  onFiltersChange: (filters: KasbonFilterValues) => void;
  onApply: () => void;
  applyDisabled?: boolean;
  loanType: LoanTypeValue;
  onLoanTypeChange: (event: SelectChangeEvent<string>) => void;
}

const KasbonFilters = ({
  filters,
  onFiltersChange,
  onApply,
  applyDisabled = false,
  loanType,
  onLoanTypeChange,
}: KasbonFiltersProps) => {
  const [availableFilters, setAvailableFilters] = useState<LoanFiltersType | null>(null);
  const [loading, setLoading] = useState(false);

  const months = Array.from({ length: 12 }, (_, i) => {
    const monthNum = (i + 1).toString().padStart(2, '0');
    const monthName = new Date(2024, i).toLocaleString('en-US', { month: 'long' });
    return { value: monthNum, label: monthName };
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());

  const loadFilters = async (employer?: string, placement?: string) => {
    setLoading(true);
    try {
      const response = await fetchLoanFilters(employer, placement, loanType);
      setAvailableFilters(response.filters);
    } catch (error) {
      console.error('Failed to fetch filters:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilters();
  }, [loanType]);

  useEffect(() => {
    if (filters.employer || filters.placement) {
      loadFilters(filters.employer || undefined, filters.placement || undefined);
    }
  }, [filters.employer, filters.placement, loanType]);

  const handleFilterChange = (field: keyof KasbonFilterValues) => (
    event: SelectChangeEvent<string>
  ) => {
    onFiltersChange({ ...filters, [field]: event.target.value });
  };

  const segmentOptions = useMemo(
    () =>
      (availableFilters?.client_segments ?? []).map((segment) => ({
        value: String(segment.option_id),
        label: segment.option_name.trim(),
      })),
    [availableFilters?.client_segments],
  );

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

  const applyButton = (
    <Button
      variant="contained"
      onClick={onApply}
      disabled={applyDisabled || loading}
      sx={{ width: { xs: '100%', md: 'auto' }, whiteSpace: 'nowrap' }}
    >
      Apply Filters
    </Button>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Grid container spacing={2} width="100%" alignItems="center">
        <Grid size={{ xs: 12, md: 'grow' }}>
          <FormControl fullWidth size="small">
            <InputLabel>Loan Type *</InputLabel>
            <Select
              value={loanType}
              label="Loan Type *"
              onChange={onLoanTypeChange}
              required
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="kasbon">Kasbon</MenuItem>
              <MenuItem value="extradana">Extradana</MenuItem>
              <MenuItem value="aku_cicil">Aku Cicil</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid
          size={{ md: 'auto' }}
          sx={{
            display: { xs: 'none', md: 'flex' },
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          {applyButton}
        </Grid>
      </Grid>

      {filters.dateMode === 'month' ? (
        <Grid container spacing={2} width="100%">
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Month</InputLabel>
              <Select
                value={filters.month}
                label="Month"
                onChange={handleFilterChange('month')}
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
                onChange={handleFilterChange('year')}
                disabled={loading}
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      ) : (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={2} width="100%">
            <Grid size={{ xs: 12, sm: 6 }}>
              <DatePicker
                label="Start Date"
                value={parseLoanDateString(filters.startDate)}
                onChange={(date) => {
                  if (!date) return;
                  onFiltersChange({ ...filters, startDate: formatLoanDate(date) });
                }}
                disabled={loading}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DatePicker
                label="End Date"
                value={parseLoanDateString(filters.endDate)}
                onChange={(date) => {
                  if (!date) return;
                  onFiltersChange({ ...filters, endDate: formatLoanDate(date) });
                }}
                disabled={loading}
                minDate={parseLoanDateString(filters.startDate) ?? undefined}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
          </Grid>
        </LocalizationProvider>
      )}

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

      <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'flex-end' }}>
        {applyButton}
      </Box>
    </Box>
  );
};

export default KasbonFilters;
