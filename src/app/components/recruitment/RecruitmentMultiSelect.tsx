'use client';

import {
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { useMemo } from 'react';
import { RecruitmentSelectOption } from './RecruitmentSearchableSelect';

interface RecruitmentMultiSelectProps {
  label: string;
  value: string[];
  options: RecruitmentSelectOption[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

const RecruitmentMultiSelect = ({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: RecruitmentMultiSelectProps) => {
  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const next = event.target.value;
    onChange(typeof next === 'string' ? next.split(',') : next);
  };

  const labelByValue = useMemo(() => new Map(options.map((o) => [o.value, o.label])), [options]);
  const selectedSet = useMemo(() => new Set(value), [value]);

  return (
    <FormControl size="small" fullWidth disabled={disabled}>
      <InputLabel shrink>{label}</InputLabel>
      <Select
        multiple
        displayEmpty
        value={value}
        onChange={handleChange}
        input={<OutlinedInput label={label} notched />}
        renderValue={(selected) => {
          if (selected.length === 0) return 'All';
          return selected.map((id) => labelByValue.get(id) ?? id).join(', ');
        }}
        MenuProps={{
          PaperProps: { sx: { maxHeight: 320 } },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value} dense>
            <Checkbox size="small" checked={selectedSet.has(option.value)} sx={{ py: 0, mr: 1 }} />
            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default RecruitmentMultiSelect;
