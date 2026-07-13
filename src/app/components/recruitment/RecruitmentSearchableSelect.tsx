'use client';

import { Autocomplete, TextField } from '@mui/material';
import { useMemo } from 'react';

export interface RecruitmentSelectOption {
  value: string;
  label: string;
}

interface RecruitmentSearchableSelectProps {
  label: string;
  value: string;
  options: RecruitmentSelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Value used when cleared / no match. Defaults to `'0'` (AOP/Recruitment). Use `''` for loan/payroll. */
  allValue?: string;
}

const RecruitmentSearchableSelect = ({
  label,
  value,
  options,
  onChange,
  disabled = false,
  allValue = '0',
}: RecruitmentSearchableSelectProps) => {
  const selected = useMemo(
    () =>
      options.find((o) => o.value === value)
      ?? options.find((o) => o.value === allValue)
      ?? options[0]
      ?? { value: allValue, label: 'All' },
    [options, value, allValue],
  );

  return (
    <Autocomplete
      size="small"
      fullWidth
      disabled={disabled}
      options={options}
      value={selected}
      onChange={(_, option) => onChange(option?.value ?? allValue)}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(a, b) => a.value === b.value}
      autoHighlight
      clearOnEscape
      renderInput={(params) => <TextField {...params} label={label} />}
      slotProps={{
        listbox: { style: { maxHeight: 280 } },
      }}
    />
  );
};

export default RecruitmentSearchableSelect;
