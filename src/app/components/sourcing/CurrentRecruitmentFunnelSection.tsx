'use client';

import { Box, Card, CircularProgress, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import type { Icon } from '@tabler/icons-react';
import {
  IconChevronRight,
  IconClipboardCheck,
  IconListDetails,
  IconMessageCircle,
  IconMoodSmile,
  IconShieldCheck,
  IconUserCheck,
  IconUsersGroup,
} from '@tabler/icons-react';
import { useState } from 'react';
import { aopCardOuterSx } from '../aop/aopStyles';
import type { CurrentRecruitmentFunnelStage, FunnelBreakdownItem } from './sourcingDummyData';

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

function withAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return hex;
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const FUNNEL_STAGE_ICONS: Record<string, { icon: Icon; color: string }> = {
  pipeline_list: { icon: IconListDetails, color: '#4F46E5' },
  pipeline: { icon: IconListDetails, color: '#4F46E5' },
  hr_interview: { icon: IconMessageCircle, color: '#2563EB' },
  skill_test: { icon: IconClipboardCheck, color: '#0891B2' },
  psychological_test: { icon: IconMoodSmile, color: '#7C3AED' },
  background_check: { icon: IconShieldCheck, color: '#0D9488' },
  second_interview: { icon: IconUsersGroup, color: '#EA580C' },
  ready_for_hiring: { icon: IconUserCheck, color: '#16A34A' },
};

function funnelIconFor(stageId: string): { icon: Icon; color: string } {
  return FUNNEL_STAGE_ICONS[stageId] ?? { icon: IconListDetails, color: '#64748B' };
}

function BreakdownList({
  items,
  valueMode,
  caption,
}: {
  items: FunnelBreakdownItem[];
  valueMode: FunnelValueMode;
  caption?: string;
}) {
  if (items.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mt: 0.5 }}>
      {caption && (
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={700}
          sx={{ lineHeight: 1.25, display: 'block', textTransform: 'uppercase', letterSpacing: 0.4 }}
        >
          {caption}
        </Typography>
      )}
      {items.map((item) => (
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
  );
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
          ) : stages.length === 0 ? (
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', py: 6 }}>
              <Typography color="text.secondary">No funnel data</Typography>
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0, pr: 0.5 }}>
                      {(() => {
                        const { icon: StageIcon, color } = funnelIconFor(stage.id);
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
                            <StageIcon size={16} stroke={1.75} />
                          </Box>
                        );
                      })()}
                      <Typography
                        color="text.secondary"
                        fontWeight={700}
                        sx={{ fontSize: '0.75rem', lineHeight: 1.3 }}
                      >
                        {stage.title}
                      </Typography>
                    </Box>
                    {index < stages.length - 1 && (
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
                      color: stage.id === 'ready_for_hiring' ? '#16A34A' : 'inherit',
                    }}
                  >
                    {formatNumber(stage.count)}
                  </Typography>
                  <BreakdownList items={stage.breakdown} valueMode={valueMode} />
                  <BreakdownList
                    items={stage.extraBreakdown ?? []}
                    valueMode={valueMode}
                    caption={stage.extraBreakdown && stage.extraBreakdown.length > 0 ? 'Status' : undefined}
                  />
                </Box>
            ))
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default CurrentRecruitmentFunnelSection;
