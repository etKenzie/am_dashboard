'use client';

import { Grid } from '@mui/material';
import RecruitmentSearchableSelect, {
  RecruitmentSelectOption,
} from '../recruitment/RecruitmentSearchableSelect';
import RecruitmentSegmentMultiSelect from '../recruitment/RecruitmentSegmentMultiSelect';

export interface ClientScopeFilterValues {
  employer: string;
  sourcedTo: string;
  project: string;
  branch: string;
  /** Empty array = all segments */
  segments: string[];
  /** Optional — when set with productType options, shown after Segment */
  productType?: string;
}

export interface ClientScopeFilterOptions {
  employers: RecruitmentSelectOption[];
  sourcedTo: RecruitmentSelectOption[];
  projects: RecruitmentSelectOption[];
  branches: RecruitmentSelectOption[];
  segments: RecruitmentSelectOption[];
  productTypes?: RecruitmentSelectOption[];
}

interface ClientScopeFiltersProps {
  values: ClientScopeFilterValues;
  options: ClientScopeFilterOptions;
  onChange: (next: ClientScopeFilterValues) => void;
  disabled?: boolean;
  /** Default All value for single-selects. AOP/Recruitment use `'0'`; loan often uses `''`. */
  allValue?: string;
  /** When false, Branch is hidden (default true to match AOP). */
  showBranch?: boolean;
}

/**
 * Shared Employer / Sourced To / Project / Branch / Segment [/ Product Type] row — same UX as AOP.
 * Product Type is included in this row when `options.productTypes` is provided.
 */
const ClientScopeFilters = ({
  values,
  options,
  onChange,
  disabled = false,
  allValue = '0',
  showBranch = true,
}: ClientScopeFiltersProps) => {
  const showProductType = Boolean(options.productTypes);
  const columnCount = (showBranch ? 5 : 4) + (showProductType ? 1 : 0);
  const size = 12 / columnCount;

  const patch = (partial: Partial<ClientScopeFilterValues>) => {
    onChange({ ...values, ...partial });
  };

  return (
    <Grid container spacing={2} width="100%">
      <Grid size={{ xs: 12, sm: 6, md: size }}>
        <RecruitmentSearchableSelect
          label="Employer"
          value={values.employer}
          options={options.employers}
          disabled={disabled && options.employers.length <= 1}
          onChange={(next) =>
            patch({
              employer: next,
              sourcedTo: allValue,
              project: allValue,
              branch: allValue,
            })
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: size }}>
        <RecruitmentSearchableSelect
          label="Sourced To"
          value={values.sourcedTo}
          options={options.sourcedTo}
          disabled={disabled && options.sourcedTo.length <= 1}
          onChange={(next) =>
            patch({
              sourcedTo: next,
              project: allValue,
              branch: allValue,
            })
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: size }}>
        <RecruitmentSearchableSelect
          label="Project"
          value={values.project}
          options={options.projects}
          disabled={disabled && options.projects.length <= 1}
          onChange={(next) => patch({ project: next })}
        />
      </Grid>
      {showBranch && (
        <Grid size={{ xs: 12, sm: 6, md: size }}>
          <RecruitmentSearchableSelect
            label="Branch"
            value={values.branch}
            options={options.branches}
            disabled={disabled && options.branches.length <= 1}
            onChange={(next) => patch({ branch: next })}
          />
        </Grid>
      )}
      <Grid size={{ xs: 12, sm: 6, md: size }}>
        <RecruitmentSegmentMultiSelect
          label="Segment"
          value={values.segments}
          options={options.segments}
          disabled={disabled && options.segments.length === 0}
          onChange={(next) => patch({ segments: next })}
        />
      </Grid>
      {showProductType && (
        <Grid size={{ xs: 12, sm: 6, md: size }}>
          <RecruitmentSearchableSelect
            label="Product Type"
            value={values.productType ?? allValue}
            options={options.productTypes ?? []}
            disabled={disabled && (options.productTypes?.length ?? 0) <= 1}
            onChange={(next) => patch({ productType: next })}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default ClientScopeFilters;
