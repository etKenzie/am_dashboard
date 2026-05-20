import type { Theme } from '@mui/material/styles';

/** More visible outer border for recruitment page cards and panels */
export const recruitmentOuterBorderColor = (mode: 'light' | 'dark') =>
  mode === 'dark' ? 'rgba(255, 255, 255, 0.26)' : 'rgba(0, 0, 0, 0.18)';

export const recruitmentCardOuterSx = (theme: Theme) => ({
  border: '1px solid',
  borderColor: recruitmentOuterBorderColor(theme.palette.mode),
  boxShadow:
    theme.palette.mode === 'dark' ? 'none' : '0 1px 4px rgba(0, 0, 0, 0.07)',
});
