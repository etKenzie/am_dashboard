'use client';

import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent
} from '@mui/material';
import { useEffect, useState } from 'react';
import { fetchInternalPayrollFilters, Department } from '../../api/internal_payroll/InternalPayrollSlice';

export interface InternalPayrollFilterValues {
  month: string;
  year: string;
  department: string; // dept_id as string, empty for all
}

interface InternalPayrollFiltersProps {
  filters: InternalPayrollFilterValues;
  onFiltersChange: (filters: InternalPayrollFilterValues) => void;
}

const InternalPayrollFilters = ({ filters, onFiltersChange }: InternalPayrollFiltersProps) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  // Generate month options (01-12)
  const months = Array.from({ length: 12 }, (_, i) => {
    const monthNum = (i + 1).toString().padStart(2, '0');
    const monthName = new Date(2024, i).toLocaleString('en-US', { month: 'long' });
    return { value: monthNum, label: monthName };
  });

  // Generate year options (current year - 5 years back)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());

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

  // Initial fetch
  useEffect(() => {
    fetchDepartmentFilters();
  }, []);

  // Refetch departments when month or year changes
  useEffect(() => {
    if (filters.month && filters.year) {
      fetchDepartmentFilters();
    }
  }, [filters.month, filters.year]);

  const handleFilterChange = (field: keyof InternalPayrollFilterValues) => (
    event: SelectChangeEvent<string>
  ) => {
    const newFilters = { ...filters, [field]: event.target.value };
    console.log('Filter changed in InternalPayrollFilters:', field, 'to', event.target.value);
    console.log('New filters:', newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <Grid container spacing={2}>
      {/* Month Filter */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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

      {/* Year Filter */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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

      {/* Department Filter */}
      <Grid size={{ xs: 12, sm: 6, md: 6 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Department</InputLabel>
          <Select
            value={filters.department}
            label="Department"
            onChange={handleFilterChange('department')}
            disabled={loading}
          >
            <MenuItem value="">All Departments</MenuItem>
            {departments.map((dept) => (
              <MenuItem key={dept.dept_id} value={dept.dept_id.toString()}>
                {dept.dept_id === 0 ? 'Valdo' : (dept.department_name || `Department ${dept.dept_id}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default InternalPayrollFilters;

