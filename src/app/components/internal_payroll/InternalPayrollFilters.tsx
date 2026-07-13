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
import { useEffect, useMemo, useState } from 'react';
import {
  Department,
  fetchInternalPayrollFilters,
  INTERNAL_PAYROLL_DEPT_CODE_OPTIONS,
} from '../../api/internal_payroll/InternalPayrollSlice';
import RecruitmentSearchableSelect from '../recruitment/RecruitmentSearchableSelect';

export interface InternalPayrollFilterValues {
  month: string;
  year: string;
  department: string; // org unit dept_id from API, empty for all
  dept_code: string; // td_karyawan.dept_code: 1–3 in UI, empty for all
  status_kontrak: string; // 0=DW, 1=PKWTT, 2=PKWT, 3=MITRA, empty for all
  valdo_inc: string; // 1=VI, 2=VSDM, empty for all (internal payroll UI)
}

interface InternalPayrollFiltersProps {
  filters: InternalPayrollFilterValues;
  onFiltersChange: (filters: InternalPayrollFilterValues) => void;
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

const InternalPayrollFilters = ({ filters, onFiltersChange }: InternalPayrollFiltersProps) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  const getDepartmentDisplayName = (dept: Department): string => {
    if (dept.dept_id === 0) return 'VALDO';
    const deptName = dept.department_name || `Department ${dept.dept_id}`;
    return deptName.toUpperCase();
  };

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

  const departmentOptions = useMemo(
    () => [
      { value: '', label: 'All Departments' },
      ...departments.map((dept) => ({
        value: dept.dept_id.toString(),
        label: getDepartmentDisplayName(dept),
      })),
    ],
    [departments],
  );

  const fetchDepartmentFilters = async () => {
    setLoading(true);
    try {
      const response = await fetchInternalPayrollFilters({
        month: filters.month || undefined,
        year: filters.year || undefined,
      });
      setDepartments(response.departments || []);
    } catch (error) {
      console.error('Failed to fetch department filters:', error);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentFilters();
  }, []);

  useEffect(() => {
    if (filters.month && filters.year) {
      fetchDepartmentFilters();
    }
  }, [filters.month, filters.year]);

  useEffect(() => {
    if (filters.valdo_inc === '31' || filters.valdo_inc === '94') {
      onFiltersChange({ ...filters, valdo_inc: '' });
    }
  }, [filters, onFiltersChange]);

  useEffect(() => {
    if (filters.dept_code === '4') {
      onFiltersChange({ ...filters, dept_code: '' });
    }
  }, [filters, onFiltersChange]);

  const handleDateChange = (field: 'month' | 'year') => (event: SelectChangeEvent<string>) => {
    onFiltersChange({ ...filters, [field]: event.target.value });
  };

  const patch = (partial: Partial<InternalPayrollFilterValues>) => {
    onFiltersChange({ ...filters, ...partial });
  };

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
              onChange={handleDateChange('year')}
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

      <Grid container spacing={2} width="100%">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RecruitmentSearchableSelect
            label="Segment"
            allValue=""
            value={filters.dept_code}
            options={segmentOptions}
            onChange={(next) => patch({ dept_code: next })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RecruitmentSearchableSelect
            label="Valdo Inc"
            allValue=""
            value={filters.valdo_inc}
            options={VALDO_INC_OPTIONS}
            disabled={loading}
            onChange={(next) => patch({ valdo_inc: next })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RecruitmentSearchableSelect
            label="Department"
            allValue=""
            value={filters.department}
            options={departmentOptions}
            disabled={loading && departmentOptions.length <= 1}
            onChange={(next) => patch({ department: next })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RecruitmentSearchableSelect
            label="Contract"
            allValue=""
            value={filters.status_kontrak}
            options={CONTRACT_OPTIONS}
            disabled={loading}
            onChange={(next) => patch({ status_kontrak: next })}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default InternalPayrollFilters;
