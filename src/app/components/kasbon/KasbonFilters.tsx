'use client';

import {
  Box,
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
import { useEffect, useState } from 'react';
import type { LoanFilters as LoanFiltersType } from '../../api/loan/LoanSlice';
import { fetchLoanFilters } from '../../api/loan/LoanSlice';
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
  clientSegment: string;
  productType: string;
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
    client_segment: filters.clientSegment || undefined,
    product_type: filters.productType || undefined,
  };
}

interface KasbonFiltersProps {
  filters: KasbonFilterValues;
  onFiltersChange: (filters: KasbonFilterValues) => void;
  loanType: LoanTypeValue;
  onLoanTypeChange: (event: SelectChangeEvent<string>) => void;
}

const KasbonFilters = ({ filters, onFiltersChange, loanType, onLoanTypeChange }: KasbonFiltersProps) => {
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Grid container spacing={2} width="100%">
        <Grid size={{ xs: 12 }}>
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

      <Grid container spacing={2} width="100%">
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Employer</InputLabel>
            <Select
              value={filters.employer}
              label="Employer"
              onChange={handleFilterChange('employer')}
              disabled={loading}
            >
              <MenuItem value="">All Employers</MenuItem>
              {availableFilters?.employers.map((employer) => (
                <MenuItem key={employer} value={employer}>
                  {employer}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Placement</InputLabel>
            <Select
              value={filters.placement}
              label="Placement"
              onChange={handleFilterChange('placement')}
              disabled={loading}
            >
              <MenuItem value="">All Placements</MenuItem>
              {availableFilters?.placements.map((placement) => (
                <MenuItem key={placement} value={placement}>
                  {placement}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Project</InputLabel>
            <Select
              value={filters.project}
              label="Project"
              onChange={handleFilterChange('project')}
              disabled={loading}
            >
              <MenuItem value="">All Projects</MenuItem>
              {availableFilters?.projects.map((project) => (
                <MenuItem key={project} value={project}>
                  {project}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Client Segment</InputLabel>
            <Select
              value={filters.clientSegment}
              label="Client Segment"
              onChange={handleFilterChange('clientSegment')}
              disabled={loading}
            >
              <MenuItem value="">All Segments</MenuItem>
              {availableFilters?.client_segments?.map((segment) => (
                <MenuItem key={segment.option_id} value={String(segment.option_id)}>
                  {segment.option_name.trim()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Product Type</InputLabel>
            <Select
              value={filters.productType}
              label="Product Type"
              onChange={handleFilterChange('productType')}
              disabled={loading}
            >
              <MenuItem value="">All Product Types</MenuItem>
              {availableFilters?.product_types?.map((type) => (
                <MenuItem key={type.option_id} value={String(type.option_id)}>
                  {type.option_name.trim()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};

export default KasbonFilters;
