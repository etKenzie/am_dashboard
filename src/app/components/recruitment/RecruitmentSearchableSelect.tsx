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
}

const RecruitmentSearchableSelect = ({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: RecruitmentSearchableSelectProps) => {
  const selected = useMemo(
    () => options.find((o) => o.value === value) ?? options[0] ?? { value: '0', label: 'All' },
    [options, value]
  );

  return (
    <Autocomplete
      size="small"
      fullWidth
      disabled={disabled}
      options={options}
      value={selected}
      onChange={(_, option) => onChange(option?.value ?? '0')}
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
