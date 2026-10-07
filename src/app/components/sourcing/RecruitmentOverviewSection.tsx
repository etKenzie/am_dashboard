'use client';

import { Box, Card, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { Icon } from '@tabler/icons-react';
import {
  IconCircleMinus,
  IconRefresh,
  IconTargetArrow,
  IconUserCheck,
  IconUsers,
  IconUsersGroup,
} from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { aopCardOuterSx } from '../aop/aopStyles';
import type { RecruitmentExecutiveKpis } from './sourcingDummyData';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface RecruitmentOverviewSectionProps {
  kpis: RecruitmentExecutiveKpis;
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

function formatNullableNumber(value: number | null): string {
  if (value === null) return '—';
  return formatNumber(value);
}

function withAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return hex;
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function OverviewKpiCell({
  title,
  value,
  icon: Icon,
  iconColor,
  loading,
}: {
  title: string;
  value: string;
  icon: Icon;
  iconColor: string;
  loading: boolean;
}) {
  return (
    <Box
      sx={{
        flex: '1 1 0',
        minWidth: 108,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: { xs: 1.25, md: 1.25 },
        py: 2,
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.5,
          bgcolor: withAlpha(iconColor, 0.12),
          color: iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={18} stroke={1.75} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          color="text.secondary"
          fontWeight={700}
          noWrap
          sx={{ fontSize: '0.75rem', lineHeight: 1.3, mb: 0.35 }}
        >
          {title}
        </Typography>
        <Typography
          fontWeight={800}
          noWrap
          lineHeight={1.15}
          sx={{
            fontSize: { xs: '1.2rem', lg: '1.35rem' },
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {loading ? <CircularProgress size={18} /> : value}
        </Typography>
      </Box>
    </Box>
  );
}

const RecruitmentOverviewSection = ({ kpis, loading = false }: RecruitmentOverviewSectionProps) => {
  const theme = useTheme();
  const target = kpis.client_target;
  const onboard = kpis.on_board;
  const gap = kpis.hiring_gap;
  const rate = kpis.fulfillment_rate;
  const remaining = target != null ? Math.max(0, target - onboard) : 0;
  const pieOnboard = target != null && target > 0 ? Math.min(onboard, target) : onboard;
  const pieRemaining = target != null && target > 0 ? remaining : 0;
  const hasPieData = target != null && (pieOnboard > 0 || pieRemaining > 0);

  const chartOptions: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: 'donut',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873',
        toolbar: { show: false },
        sparkline: { enabled: true },
      },
      labels: ['Onboard', 'Gap'],
      colors: ['#0D9488', theme.palette.mode === 'dark' ? '#374151' : '#E5E7EB'],
      stroke: { width: 2, colors: [theme.palette.background.paper] },
      dataLabels: { enabled: false },
      legend: { show: false },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: '74%',
            labels: { show: false },
          },
        },
      },
      tooltip: {
        y: {
          formatter: (val: number) => val.toLocaleString('en-US'),
        },
      },
    }),
    [theme],
  );

  const kpiItems = [
    {
      title: 'Client Target',
      value: formatNullableNumber(kpis.client_target),
      icon: IconTargetArrow,
      iconColor: '#4F46E5',
    },
    {
      title: 'On Pipe Funnel',
      value: formatNumber(kpis.on_pipe_funnel),
      icon: IconUsersGroup,
      iconColor: '#2563EB',
    },
    {
      title: 'Hired by TA',
      value: formatNumber(kpis.hired),
      icon: IconUserCheck,
      iconColor: '#16A34A',
    },
    {
      title: 'Swing',
      value: formatNumber(kpis.swing),
      icon: IconRefresh,
      iconColor: '#059669',
    },
    {
      title: 'Total Onboard',
      value: formatNumber(kpis.on_board),
      icon: IconUsers,
      iconColor: '#0D9488',
    },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, mt: 0, fontWeight: 700 }}>
        Recruitment Overview
      </Typography>

      <Card
        sx={(t) => ({
          overflowX: 'auto',
          overflowY: 'hidden',
          borderRadius: 0,
          ...aopCardOuterSx(t),
        })}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            alignItems: 'stretch',
          }}
        >
          {kpiItems.flatMap((item, index) => [
            ...(index > 0
              ? [
                  <Box
                    key={`${item.title}-sep`}
                    sx={{
                      flexShrink: 0,
                      width: { xs: '100%', lg: '1px' },
                      height: { xs: '1px', lg: 'auto' },
                      alignSelf: 'stretch',
                      bgcolor: 'divider',
                      borderRadius: 0,
                    }}
                  />,
                ]
              : []),
            <Box key={item.title} sx={{ display: 'flex', flex: '1 1 0', minWidth: 108 }}>
              <OverviewKpiCell
                title={item.title}
                value={item.value}
                icon={item.icon}
                iconColor={item.iconColor}
                loading={loading}
              />
            </Box>,
          ])}

          <Box
            sx={{
              flexShrink: 0,
              width: { xs: '100%', lg: '1px' },
              height: { xs: '1px', lg: 'auto' },
              alignSelf: 'stretch',
              bgcolor: 'divider',
              borderRadius: 0,
            }}
          />

          <Box
            sx={{
              flex: '1.35 1 0',
              minWidth: 156,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: { xs: 1.25, md: 1.25 },
              py: 1.5,
            }}
          >
            {loading ? (
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={18} />
              </Box>
            ) : (
              <>
                <Box
                  sx={{
                    position: 'relative',
                    width: 36,
                    height: 36,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {hasPieData ? (
                    <ReactApexChart
                      options={chartOptions}
                      series={[pieOnboard, pieRemaining]}
                      type="donut"
                      height={36}
                      width={36}
                    />
                  ) : (
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                      —
                    </Typography>
                  )}
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    color="text.secondary"
                    fontWeight={700}
                    noWrap
                    sx={{ fontSize: '0.75rem', lineHeight: 1.3, mb: 0.35 }}
                  >
                    Fulfillment Rate
                  </Typography>
                  <Typography
                    fontWeight={800}
                    noWrap
                    lineHeight={1.15}
                    sx={{
                      fontSize: { xs: '1.2rem', lg: '1.35rem' },
                      fontVariantNumeric: 'tabular-nums',
                      mb: 0.35,
                    }}
                  >
                    {rate == null ? '—' : formatPercent(rate)}
                  </Typography>
                  {[
                    { label: 'Target', value: formatNullableNumber(target) },
                    { label: 'Onboard', value: formatNumber(onboard) },
                  ].map((row) => (
                    <Box
                      key={row.label}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        gap: 1,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        {row.label}
                      </Typography>
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {row.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </Box>

          <Box
            sx={{
              flexShrink: 0,
              width: { xs: '100%', lg: '1px' },
              height: { xs: '1px', lg: 'auto' },
              alignSelf: 'stretch',
              bgcolor: 'divider',
              borderRadius: 0,
            }}
          />

          <Box sx={{ display: 'flex', flex: '1 1 0', minWidth: 108 }}>
            <OverviewKpiCell
              title="GAP"
              value={formatNullableNumber(gap)}
              icon={IconCircleMinus}
              iconColor="#DC2626"
              loading={loading}
            />
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default RecruitmentOverviewSection;
