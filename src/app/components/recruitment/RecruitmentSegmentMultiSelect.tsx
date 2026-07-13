'use client';

import {
  Checkbox,
  Divider,
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

interface RecruitmentSegmentMultiSelectProps {
  label: string;
  value: string[];
  options: RecruitmentSelectOption[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

const BFSI_SEGMENT_IDS = new Set(['3', '7', '8', '9']);
const NON_BFSI_SEGMENT_IDS = new Set(['1', '2', '4', '5', '6']);
export const ALL_BFSI_ID = 'bfsi_all';
export const ALL_NON_BFSI_ID = 'non_bfsi_all';

function normalizeLabel(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, ' ');
}

function isAllBfsiOption(option: RecruitmentSelectOption): boolean {
  return (
    option.value === ALL_BFSI_ID
    || option.value === 'all_bfsi'
    || normalizeLabel(option.label) === 'all bfsi'
  );
}

function isAllNonBfsiOption(option: RecruitmentSelectOption): boolean {
  return (
    option.value === ALL_NON_BFSI_ID
    || option.value === 'all_non_bfsi'
    || normalizeLabel(option.label) === 'all non-bfsi'
    || normalizeLabel(option.label) === 'all non bfsi'
  );
}

function isBfsiSegmentOption(option: RecruitmentSelectOption): boolean {
  if (isAllBfsiOption(option) || isAllNonBfsiOption(option)) return false;
  if (BFSI_SEGMENT_IDS.has(option.value)) return true;
  return /^bfsi\b/i.test(option.label.trim());
}

function isNonBfsiSegmentOption(option: RecruitmentSelectOption): boolean {
  if (isAllBfsiOption(option) || isAllNonBfsiOption(option)) return false;
  if (NON_BFSI_SEGMENT_IDS.has(option.value)) return true;
  return /^non[\s-]?bfsi\b/i.test(option.label.trim());
}

function partitionSegmentOptions(options: RecruitmentSelectOption[]) {
  const bfsi: RecruitmentSelectOption[] = [];
  const nonBfsi: RecruitmentSelectOption[] = [];
  const other: RecruitmentSelectOption[] = [];

  for (const option of options) {
    if (isAllBfsiOption(option) || isAllNonBfsiOption(option)) {
      continue;
    }
    if (isBfsiSegmentOption(option)) {
      bfsi.push(option);
    } else if (isNonBfsiSegmentOption(option)) {
      nonBfsi.push(option);
    } else {
      other.push(option);
    }
  }

  return { bfsi, nonBfsi, other };
}

function resolveSegmentSelection(
  previous: string[],
  next: string[],
  options: RecruitmentSelectOption[],
): string[] {
  const allBfsiId = options.find(isAllBfsiOption)?.value ?? ALL_BFSI_ID;
  const allNonBfsiId = options.find(isAllNonBfsiOption)?.value ?? ALL_NON_BFSI_ID;

  const prevSet = new Set(previous);
  const added = next.filter((id) => !prevSet.has(id));

  if (added.includes(allBfsiId)) {
    return [allBfsiId];
  }
  if (added.includes(allNonBfsiId)) {
    return [allNonBfsiId];
  }

  if (previous.includes(allBfsiId) && next.includes(allBfsiId) && next.length > 1) {
    return [allBfsiId];
  }
  if (previous.includes(allNonBfsiId) && next.includes(allNonBfsiId) && next.length > 1) {
    return [allNonBfsiId];
  }

  return next.filter((id) => id !== allBfsiId && id !== allNonBfsiId);
}

const RecruitmentSegmentMultiSelect = ({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: RecruitmentSegmentMultiSelectProps) => {
  const allBfsiOption = useMemo(
    () => options.find((o) => o.value === ALL_BFSI_ID) ?? options.find(isAllBfsiOption),
    [options],
  );
  const allNonBfsiOption = useMemo(
    () => options.find((o) => o.value === ALL_NON_BFSI_ID) ?? options.find(isAllNonBfsiOption),
    [options],
  );
  const { bfsi, nonBfsi, other } = useMemo(() => partitionSegmentOptions(options), [options]);
  const labelByValue = useMemo(() => new Map(options.map((o) => [o.value, o.label])), [options]);
  const selectedSet = useMemo(() => new Set(value), [value]);

  const allBfsiId = allBfsiOption?.value ?? ALL_BFSI_ID;
  const allNonBfsiId = allNonBfsiOption?.value ?? ALL_NON_BFSI_ID;
  const isAllBfsiSelected = selectedSet.has(allBfsiId);
  const isAllNonBfsiSelected = selectedSet.has(allNonBfsiId);

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const rawNext =
      typeof event.target.value === 'string' ? event.target.value.split(',') : [...event.target.value];
    onChange(resolveSegmentSelection(value, rawNext, options));
  };

  const renderGroupItem = (option: RecruitmentSelectOption | undefined, itemDisabled = false) => {
    if (!option) return null;

    return (
      <MenuItem
        key={option.value}
        value={option.value}
        dense
        disabled={itemDisabled}
        sx={{ fontWeight: 600 }}
      >
        <ListItemText
          primary={option.label}
          primaryTypographyProps={{ fontWeight: 600, color: 'primary.main' }}
        />
      </MenuItem>
    );
  };

  const renderCheckboxItem = (option: RecruitmentSelectOption, itemDisabled = false) => (
    <MenuItem key={option.value} value={option.value} dense disabled={itemDisabled}>
      <Checkbox
        size="small"
        checked={selectedSet.has(option.value)}
        disabled={itemDisabled}
        sx={{ py: 0, mr: 1 }}
      />
      <ListItemText primary={option.label} />
    </MenuItem>
  );

  const showBfsiGroup = Boolean(allBfsiOption) || bfsi.length > 0;
  const showNonBfsiGroup = Boolean(allNonBfsiOption) || nonBfsi.length > 0;

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
          PaperProps: { sx: { maxHeight: 360 } },
        }}
      >
        {renderGroupItem(allBfsiOption)}
        {bfsi.map((option) => renderCheckboxItem(option, isAllBfsiSelected || isAllNonBfsiSelected))}

        {showBfsiGroup && showNonBfsiGroup && <Divider sx={{ my: 0.5 }} />}

        {renderGroupItem(allNonBfsiOption)}
        {nonBfsi.map((option) => renderCheckboxItem(option, isAllBfsiSelected || isAllNonBfsiSelected))}

        {other.length > 0 && (showBfsiGroup || showNonBfsiGroup) && <Divider sx={{ my: 0.5 }} />}
        {other.map((option) => renderCheckboxItem(option, isAllBfsiSelected || isAllNonBfsiSelected))}
      </Select>
    </FormControl>
  );
};

export default RecruitmentSegmentMultiSelect;
