'use client';

import { Box, CircularProgress, Typography } from '@mui/material';
import {
  IconBriefcase,
  IconClipboardList,
  IconPercentage,
  IconUserCheck,
} from '@tabler/icons-react';
import type { Icon } from '@tabler/icons-react';
import { FulfillmentMetrics } from '../../api/recruitment/RecruitmentSlice';

const PURPLE_ICON = '#7C3AED';
const PURPLE_ICON_BG = 'rgba(167, 139, 250, 0.28)';

const innerDivider = (mode: string) =>
  mode === 'dark' ? 'rgba(255, 255, 255, 0.28)' : 'rgba(0, 0, 0, 0.16)';

interface FulfillmentMetricsQuadProps {
  metrics: FulfillmentMetrics | undefined;
  loading?: boolean;
}

const QUAD_ITEMS: Array<{
  key: keyof FulfillmentMetrics;
  label: string;
  icon: Icon;
  format: (m: FulfillmentMetrics) => string;
}> = [
  {
    key: 'active_vacancies',
    label: 'Active Vacancies',
    icon: IconBriefcase,
    format: (m) => m.active_vacancies.toLocaleString('en-US'),
  },
  {
    key: 'active_requested_count',
    label: 'Active Requested Count',
    icon: IconClipboardList,
    format: (m) => m.active_requested_count.toLocaleString('en-US'),
  },
  {
    key: 'fulfilled_headcount',
    label: 'Fulfilled Headcount',
    icon: IconUserCheck,
    format: (m) => m.fulfilled_headcount.toLocaleString('en-US'),
  },
  {
    key: 'fulfilment_rate',
    label: 'Fulfilment Rate',
    icon: IconPercentage,
    format: (m) => `${m.fulfilment_rate.toLocaleString('en-US', { maximumFractionDigits: 1 })}%`,
  },
];

const FulfillmentMetricsQuad = ({ metrics, loading = false }: FulfillmentMetricsQuadProps) => {
  return (
    <Box
      sx={(theme) => ({
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 0,
        flex: 1,
        height: '100%',
        minHeight: { xs: 260, lg: '100%' },
        borderRadius: 0,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: '1px',
          bgcolor: innerDivider(theme.palette.mode),
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          zIndex: 1,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          width: '1px',
          bgcolor: innerDivider(theme.palette.mode),
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          zIndex: 1,
        },
      })}
    >
      {QUAD_ITEMS.map((item) => {
        const IconComponent = item.icon;
        return (
          <Box
            key={item.key}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              pt: 2,
              pb: 2,
              px: 2.5,
              minHeight: { xs: 130, sm: 0 },
              borderRadius: 0,
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: PURPLE_ICON_BG,
                color: PURPLE_ICON,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
              }}
            >
              <IconComponent size={24} stroke={1.75} />
            </Box>

            <Typography
              fontWeight={700}
              lineHeight={1.15}
              sx={{
                fontSize: { xs: '1.65rem', sm: '1.85rem' },
                mb: 0.5,
                mt: 0,
              }}
            >
              {loading || !metrics ? <CircularProgress size={26} /> : item.format(metrics)}
            </Typography>
            <Typography
              color="text.secondary"
              fontWeight={600}
              sx={{
                fontSize: { xs: '0.9rem', sm: '1rem' },
                lineHeight: 1.35,
              }}
            >
              {item.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export default FulfillmentMetricsQuad;
