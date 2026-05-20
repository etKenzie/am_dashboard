'use client';

import { Box, CircularProgress, Typography } from '@mui/material';
import type { Icon } from '@tabler/icons-react';
import DashboardCard from '../shared/DashboardCard';
import { recruitmentCardOuterSx } from './recruitmentStyles';

const PURPLE_ICON = '#7C3AED';
const PURPLE_ICON_BG = 'rgba(167, 139, 250, 0.28)';

interface RecruitmentMetricCardProps {
  title: string;
  value: React.ReactNode;
  icon: Icon;
  loading?: boolean;
}

const RecruitmentMetricCard = ({
  title,
  value,
  icon: Icon,
  loading = false,
}: RecruitmentMetricCardProps) => {
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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flex: 1,
          minHeight: 100,
        }}
      >
        <Box
          sx={{
            width: 68,
            height: 68,
            borderRadius: 2.5,
            bgcolor: PURPLE_ICON_BG,
            color: PURPLE_ICON,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={34} stroke={1.75} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            lineHeight={1.2}
            sx={{ fontSize: { xs: '1.35rem', sm: '1.5rem' } }}
          >
            {loading ? <CircularProgress size={24} /> : value}
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            fontWeight={600}
            sx={{ mt: 0.5, fontSize: { xs: '0.875rem', sm: '0.9375rem' }, lineHeight: 1.35 }}
          >
            {title}
          </Typography>
        </Box>
      </Box>
    </DashboardCard>
  );
};

export default RecruitmentMetricCard;
