'use client';

import { Box, CircularProgress, Typography } from '@mui/material';
import type { Icon } from '@tabler/icons-react';
import DashboardCard from '../shared/DashboardCard';
import { aopCardOuterSx } from './aopStyles';

const TEAL_ICON = '#0D9488';
const TEAL_ICON_BG = 'rgba(45, 212, 191, 0.28)';

interface AopMetricCardProps {
  title: string;
  value: React.ReactNode;
  icon: Icon;
  loading?: boolean;
  /** Smaller icon tile for dense KPI grids (e.g. Sourcing). */
  compact?: boolean;
}

const AopMetricCard = ({
  title,
  value,
  icon: Icon,
  loading = false,
  compact = false,
}: AopMetricCardProps) => {
  const iconBoxSize = compact ? 44 : 68;
  const iconSize = compact ? 22 : 34;

  return (
    <DashboardCard
      cardSx={(theme) => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...aopCardOuterSx(theme),
      })}
      contentSx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        p: compact ? '16px !important' : '20px !important',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: compact ? 1.5 : 2,
          flex: 1,
          minHeight: compact ? 72 : 100,
        }}
      >
        <Box
          sx={{
            width: iconBoxSize,
            height: iconBoxSize,
            borderRadius: compact ? 2 : 2.5,
            bgcolor: TEAL_ICON_BG,
            color: TEAL_ICON,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={iconSize} stroke={1.75} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            lineHeight={1.2}
            sx={{ fontSize: compact ? { xs: '1.15rem', sm: '1.25rem' } : { xs: '1.35rem', sm: '1.5rem' } }}
          >
            {loading ? <CircularProgress size={compact ? 20 : 24} /> : value}
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            fontWeight={600}
            sx={{
              mt: 0.5,
              fontSize: compact ? { xs: '0.8rem', sm: '0.85rem' } : { xs: '0.875rem', sm: '0.9375rem' },
              lineHeight: 1.35,
            }}
          >
            {title}
          </Typography>
        </Box>
      </Box>
    </DashboardCard>
  );
};

export default AopMetricCard;
