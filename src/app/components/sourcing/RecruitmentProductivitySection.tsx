'use client';

import { Box, Card, CircularProgress, Typography } from '@mui/material';
import type { Icon } from '@tabler/icons-react';
import {
  IconChevronRight,
  IconFilter,
  IconMessageCircle,
  IconMoodSmile,
  IconPercentage,
  IconUserCheck,
  IconUserPlus,
  IconUsers,
} from '@tabler/icons-react';
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

function withAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return hex;
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const PRODUCTIVITY_ICONS: Record<string, { icon: Icon; color: string }> = {
  new_candidates: { icon: IconUsers, color: '#2563EB' },
  processed: { icon: IconFilter, color: '#4F46E5' },
  interviewed: { icon: IconMessageCircle, color: '#0891B2' },
  psych_test_assigned: { icon: IconMoodSmile, color: '#7C3AED' },
  ready_for_hiring: { icon: IconUserCheck, color: '#16A34A' },
  hired_by_ta: { icon: IconUserPlus, color: '#059669' },
  hiring_rate: { icon: IconPercentage, color: '#16A34A' },
};

function productivityIconFor(id: string): { icon: Icon; color: string } {
  return PRODUCTIVITY_ICONS[id] ?? { icon: IconUsers, color: '#64748B' };
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0, pr: 0.5 }}>
                    {(() => {
                      const { icon: MetricIcon, color } = productivityIconFor(metric.id);
                      return (
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: 1,
                            bgcolor: withAlpha(color, 0.12),
                            color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <MetricIcon size={16} stroke={1.75} />
                        </Box>
                      );
                    })()}
                    <Typography
                      color="text.secondary"
                      fontWeight={700}
                      sx={{ fontSize: '0.75rem', lineHeight: 1.3 }}
                    >
                      {metric.title}
                    </Typography>
                  </Box>
                  {index < metrics.length - 1 && (
                    <Box sx={{ color: 'text.disabled', flexShrink: 0, mt: 0.4, display: { xs: 'none', lg: 'flex' } }}>
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
