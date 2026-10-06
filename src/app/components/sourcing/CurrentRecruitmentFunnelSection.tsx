'use client';

import { Box, Card, CircularProgress, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { IconChevronRight } from '@tabler/icons-react';
import { useState } from 'react';
import { aopCardOuterSx } from '../aop/aopStyles';
import type { CurrentRecruitmentFunnelStage } from './sourcingDummyData';

interface CurrentRecruitmentFunnelSectionProps {
  stages: CurrentRecruitmentFunnelStage[];
  loading?: boolean;
}

type FunnelValueMode = 'count' | 'percent';

function formatNumber(value: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatPercent(value: number): string {
  return `${value.toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

const CurrentRecruitmentFunnelSection = ({
  stages,
  loading = false,
}: CurrentRecruitmentFunnelSectionProps) => {
  const [valueMode, setValueMode] = useState<FunnelValueMode>('count');

  return (
    <Box mt={4}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          mb: 2,
        }}
      >
        <Typography variant="h5" sx={{ mt: 0, fontWeight: 600 }}>
          Current Recruitment Funnel
        </Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={valueMode}
          onChange={(_, next: FunnelValueMode | null) => {
            if (next) setValueMode(next);
          }}
        >
          <ToggleButton value="count">Count</ToggleButton>
          <ToggleButton value="percent">Percentage</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Card sx={(t) => ({ overflow: 'hidden', borderRadius: 0, ...aopCardOuterSx(t) })}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            alignItems: 'stretch',
            overflowX: { lg: 'auto' },
          }}
        >
          {loading ? (
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            stages.map((stage, index) => (
                <Box
                  key={stage.id}
                  sx={{
                    flex: '1 1 0',
                    minWidth: { lg: 128 },
                    px: { xs: 2, lg: 1.5 },
                    py: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                    position: 'relative',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.5 }}>
                    <Typography
                      color="text.secondary"
                      fontWeight={600}
                      sx={{ fontSize: '0.75rem', lineHeight: 1.3, pr: 0.5 }}
                    >
                      {stage.title}
                    </Typography>
                    {index < stages.length - 1 && (
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
                      color: stage.id === 'ready_for_hiring' ? '#16A34A' : 'inherit',
                    }}
                  >
                    {formatNumber(stage.count)}
                  </Typography>
                  {stage.breakdown.length > 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mt: 0.5 }}>
                      {stage.breakdown.map((item) => (
                        <Box key={item.label}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={600}
                            sx={{ lineHeight: 1.25, display: 'block' }}
                          >
                            {item.label}
                          </Typography>
                          <Typography
                            variant="caption"
                            fontWeight={700}
                            sx={{ fontVariantNumeric: 'tabular-nums', display: 'block', lineHeight: 1.25 }}
                          >
                            {valueMode === 'percent' ? formatPercent(item.percent) : formatNumber(item.count)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
            ))
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default CurrentRecruitmentFunnelSection;
