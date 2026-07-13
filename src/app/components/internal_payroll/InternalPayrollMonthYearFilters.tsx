'use client';

import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { useEffect, useMemo } from 'react';
import { INTERNAL_PAYROLL_DEPT_CODE_OPTIONS } from '../../api/internal_payroll/InternalPayrollSlice';
import RecruitmentSearchableSelect from '../recruitment/RecruitmentSearchableSelect';

export interface InternalPayrollMonthYearFilterValues {
  month: string;
  year: string;
  dept_code?: string;
  status_kontrak?: string; // 0=DW, 1=PKWTT, 2=PKWT, 3=MITRA, empty for all
  valdo_inc?: string; // 1=VI, 2=VSDM, empty for all (internal payroll UI)
}

interface InternalPayrollMonthYearFiltersProps {
  filters: InternalPayrollMonthYearFilterValues;
  onFiltersChange: (filters: InternalPayrollMonthYearFilterValues) => void;
}

const VALDO_INC_OPTIONS = [
  { value: '', label: 'All' },
  { value: '1', label: 'VI' },
  { value: '2', label: 'VSDM' },
];

const CONTRACT_OPTIONS = [
  { value: '', label: 'All Contracts' },
  { value: '0', label: 'DW' },
  { value: '1', label: 'PKWTT' },
  { value: '2', label: 'PKWT' },
  { value: '3', label: 'MITRA' },
];

const InternalPayrollMonthYearFilters = ({
  filters,
  onFiltersChange,
}: InternalPayrollMonthYearFiltersProps) => {
  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const monthNum = (i + 1).toString().padStart(2, '0');
        const monthName = new Date(2024, i).toLocaleString('en-US', { month: 'long' });
        return { value: monthNum, label: monthName };
      }),
    [],
  );

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());
  }, []);

  const segmentOptions = useMemo(
    () => [
      { value: '', label: 'All' },
      ...INTERNAL_PAYROLL_DEPT_CODE_OPTIONS.map((opt) => ({
        value: opt.value,
        label: opt.label,
      })),
    ],
    [],
  );

  const handleDateChange = (field: 'month' | 'year') => (event: SelectChangeEvent<string>) => {
    onFiltersChange({ ...filters, [field]: event.target.value });
  };

  const patch = (partial: Partial<InternalPayrollMonthYearFilterValues>) => {
    onFiltersChange({ ...filters, ...partial });
  };

  useEffect(() => {
    const v = filters.valdo_inc ?? '';
    if (v === '31' || v === '94') {
      onFiltersChange({ ...filters, valdo_inc: '' });
    }
  }, [filters, onFiltersChange]);

  useEffect(() => {
    if (filters.dept_code === '4') {
      onFiltersChange({ ...filters, dept_code: '' });
    }
  }, [filters, onFiltersChange]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Grid container spacing={2} width="100%">
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Month</InputLabel>
            <Select
              value={filters.month}
              label="Month"
              onChange={handleDateChange('month')}
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
              onChange={handleDateChange('year')}
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

      <Grid container spacing={2} width="100%">
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <RecruitmentSearchableSelect
            label="Segment"
            allValue=""
            value={filters.dept_code || ''}
            options={segmentOptions}
            onChange={(next) => patch({ dept_code: next })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <RecruitmentSearchableSelect
            label="Valdo Inc"
            allValue=""
            value={filters.valdo_inc || ''}
            options={VALDO_INC_OPTIONS}
            onChange={(next) => patch({ valdo_inc: next })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <RecruitmentSearchableSelect
            label="Contract"
            allValue=""
            value={filters.status_kontrak || ''}
            options={CONTRACT_OPTIONS}
            onChange={(next) => patch({ status_kontrak: next })}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default InternalPayrollMonthYearFilters;
