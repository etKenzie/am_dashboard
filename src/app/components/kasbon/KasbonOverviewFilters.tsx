'use client';

import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useEffect, useState } from 'react';
import type { LoanFilters as LoanFiltersType } from '../../api/loan/LoanSlice';
import { fetchLoanFilters } from '../../api/loan/LoanSlice';

export interface KasbonOverviewFilterValues {
  month: string;
  year: string;
  clientSegment: string;
  productType: string;
}

interface KasbonOverviewFiltersProps {
  filters: KasbonOverviewFilterValues;
  onFiltersChange: (filters: KasbonOverviewFilterValues) => void;
  loanType?: string;
}

const KasbonOverviewFilters = ({ filters, onFiltersChange, loanType }: KasbonOverviewFiltersProps) => {
  const [availableFilters, setAvailableFilters] = useState<LoanFiltersType | null>(null);
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
    fetchLoanFilters(undefined, undefined, loanType)
      .then((response) => setAvailableFilters(response.filters))
      .catch((error) => console.error('Failed to fetch loan filters:', error));
  }, [loanType]);

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
      <FormControl sx={{ minWidth: 120 }} size="small">
        <InputLabel>Month</InputLabel>
        <Select
          value={filters.month}
          label="Month"
          onChange={(e) => onFiltersChange({ ...filters, month: e.target.value })}
        >
          {months.map((month) => (
            <MenuItem key={month.value} value={month.value}>
              {month.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 120 }} size="small">
        <InputLabel>Year</InputLabel>
        <Select
          value={filters.year}
          label="Year"
          onChange={(e) => onFiltersChange({ ...filters, year: e.target.value })}
        >
          {years.map((year) => (
            <MenuItem key={year} value={year.toString()}>
              {year}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 160 }} size="small">
        <InputLabel>Client Segment</InputLabel>
        <Select
          value={filters.clientSegment}
          label="Client Segment"
          onChange={(e) => onFiltersChange({ ...filters, clientSegment: e.target.value })}
        >
          <MenuItem value="">All Segments</MenuItem>
          {availableFilters?.client_segments?.map((segment) => (
            <MenuItem key={segment.option_id} value={String(segment.option_id)}>
              {segment.option_name.trim()}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 160 }} size="small">
        <InputLabel>Product Type</InputLabel>
        <Select
          value={filters.productType}
          label="Product Type"
          onChange={(e) => onFiltersChange({ ...filters, productType: e.target.value })}
        >
          <MenuItem value="">All Product Types</MenuItem>
          {availableFilters?.product_types?.map((type) => (
            <MenuItem key={type.option_id} value={String(type.option_id)}>
              {type.option_name.trim()}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default KasbonOverviewFilters;
