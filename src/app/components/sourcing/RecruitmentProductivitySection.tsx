'use client';

import { Box, Card, CircularProgress, Typography } from '@mui/material';
import { IconChevronRight } from '@tabler/icons-react';
import { aopCardOuterSx } from '../aop/aopStyles';
import type { RecruitmentProductivityMetric } from './sourcingDummyData';

interface RecruitmentProductivitySectionProps {
  metrics: RecruitmentProductivityMetric[];
  loading?: boolean;
}

function formatNumber(value: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatPercent(value: number): string {
  return `${value.toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

const RecruitmentProductivitySection = ({
  metrics,
  loading = false,
}: RecruitmentProductivitySectionProps) => {
  return (
    <Box mt={4}>
      <Typography variant="h5" sx={{ mb: 2, mt: 0, fontWeight: 600 }}>
        Recruitment Productivity
      </Typography>

      <Card sx={(t) => ({ overflow: 'hidden', borderRadius: 0, ...aopCardOuterSx(t) })}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            alignItems: 'stretch',
          }}
        >
          {loading ? (
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            metrics.map((metric, index) => (
              <Box
                key={metric.id}
                sx={{
                  flex: '1 1 0',
                  minWidth: 0,
                  px: { xs: 2, lg: 1.75 },
                  py: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.5 }}>
                  <Typography
                    color="text.secondary"
                    fontWeight={600}
                    sx={{ fontSize: '0.75rem', lineHeight: 1.3, pr: 0.5 }}
                  >
                    {metric.title}
                  </Typography>
                  {index < metrics.length - 1 && (
                    <Box sx={{ color: 'text.disabled', flexShrink: 0, mt: 0.1, display: { xs: 'none', lg: 'flex' } }}>
                      <IconChevronRight size={16} stroke={2} />
                    </Box>
                  )}
                </Box>
                <Typography
                  fontWeight={800}
                  lineHeight={1.15}
                  sx={{
                    fontSize: { xs: '1.35rem', lg: '1.5rem' },
                    fontVariantNumeric: 'tabular-nums',
                    color:
                      metric.id === 'ready_for_hiring' || metric.id === 'hired_by_ta' || metric.id === 'hiring_rate'
                        ? '#16A34A'
                        : 'inherit',
                  }}
                >
                  {metric.format === 'percent' ? formatPercent(metric.value) : formatNumber(metric.value)}
                </Typography>
              </Box>
            ))
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default RecruitmentProductivitySection;
