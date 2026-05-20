'use client';

import { Box, CircularProgress, LinearProgress, Typography } from '@mui/material';
import DashboardCard from '../shared/DashboardCard';
import { recruitmentCardOuterSx } from './recruitmentStyles';

/** Same as icon glyph in top summary cards (not the icon box background) */
const PURPLE_ICON = '#7C3AED';
const PURPLE_CAPTION = '#9F7AEA';

interface RecruitmentFunnelCardProps {
  title: string;
  count: number;
  /** 0–100 for progress bar and pass rate label */
  passRate: number;
  loading?: boolean;
}

const RecruitmentFunnelCard = ({ title, count, passRate, loading = false }: RecruitmentFunnelCardProps) => {
  const clampedRate = Math.min(100, Math.max(0, passRate));

  return (
    <DashboardCard
      cardSx={(theme) => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...recruitmentCardOuterSx(theme),
      })}
      contentSx={{ flex: 1, display: 'flex', flexDirection: 'column', p: '20px !important' }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, flex: 1 }}>
        <Typography variant="h4" fontWeight={700} lineHeight={1.2}>
          {loading ? <CircularProgress size={24} /> : count.toLocaleString('en-US')}
        </Typography>
        <Typography
          variant="subtitle1"
          color="text.secondary"
          fontWeight={600}
          sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' }, lineHeight: 1.35 }}
        >
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
          <LinearProgress
            variant="determinate"
            value={loading ? 0 : clampedRate}
            sx={{
              flex: 1,
              height: 8,
              borderRadius: 4,
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : '#E5E7EB'),
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                bgcolor: PURPLE_ICON,
              },
            }}
          />
          <Typography
            variant="body2"
            sx={{ color: PURPLE_ICON, fontWeight: 700, minWidth: 36, textAlign: 'right', flexShrink: 0 }}
          >
            {loading ? '—' : `${clampedRate}%`}
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: PURPLE_CAPTION, fontWeight: 500 }}>
          {loading ? '—' : `${clampedRate}% pass rate`}
        </Typography>
      </Box>
    </DashboardCard>
  );
};

export default RecruitmentFunnelCard;
