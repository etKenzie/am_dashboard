import type { Theme } from '@mui/material/styles';

export const aopOuterBorderColor = (mode: 'light' | 'dark') =>
  mode === 'dark' ? 'rgba(255, 255, 255, 0.26)' : 'rgba(0, 0, 0, 0.18)';

export const aopCardOuterSx = (theme: Theme) => ({
  border: '1px solid',
  borderColor: aopOuterBorderColor(theme.palette.mode),
  boxShadow:
    theme.palette.mode === 'dark' ? 'none' : '0 1px 4px rgba(0, 0, 0, 0.07)',
});
