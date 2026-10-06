'use client';

import { Box, Card, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { Icon } from '@tabler/icons-react';
import {
  IconRefresh,
  IconTargetArrow,
  IconUserCheck,
  IconUsers,
  IconUsersGroup,
} from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { aopCardOuterSx } from '../aop/aopStyles';
import type { SourcingExecutiveKpis } from './sourcingDummyData';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface RecruitmentOverviewSectionProps {
  kpis: SourcingExecutiveKpis;
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
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: { xs: 1.5, md: 2 },
        py: 2,
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1.5,
          bgcolor: withAlpha(iconColor, 0.12),
          color: iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={20} stroke={1.75} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          color="text.secondary"
          fontWeight={600}
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
  const gap = Math.max(0, kpis.hiring_gap);
  const rate = Math.min(100, Math.max(0, kpis.fulfillment_rate));
  const remaining = Math.max(0, target - onboard);
  const pieOnboard = target > 0 ? Math.min(onboard, target) : onboard;
  const pieRemaining = target > 0 ? remaining : 0;
  const hasPieData = pieOnboard > 0 || pieRemaining > 0;

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
      value: formatNumber(kpis.client_target),
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

  const statRows = [
    { label: 'Target', value: formatNumber(target) },
    { label: 'Onboard', value: formatNumber(onboard) },
    { label: 'Gap', value: formatNumber(gap) },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, mt: 0, fontWeight: 600 }}>
        Recruitment Overview
      </Typography>

      <Card
        sx={(t) => ({
          overflow: 'hidden',
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
            <Box key={item.title} sx={{ display: 'flex', flex: '1 1 0', minWidth: 0 }}>
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
              flex: { xs: '1 1 auto', lg: '1.15 1 0' },
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: { xs: 1.5, md: 2 },
              py: 1.5,
            }}
          >
            {loading ? (
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={20} />
              </Box>
            ) : (
              <>
                <Box
                  sx={{
                    position: 'relative',
                    width: 64,
                    height: 64,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {hasPieData ? (
                    <>
                      <ReactApexChart
                        options={chartOptions}
                        series={[pieOnboard, pieRemaining]}
                        type="donut"
                        height={64}
                        width={64}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          textAlign: 'center',
                          pointerEvents: 'none',
                        }}
                      >
                        <Typography fontWeight={800} sx={{ fontSize: '0.65rem', lineHeight: 1.1 }}>
                          {formatPercent(rate)}
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      —
                    </Typography>
                  )}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    color="text.secondary"
                    fontWeight={600}
                    noWrap
                    sx={{ fontSize: '0.75rem', lineHeight: 1.3, mb: 0.35 }}
                  >
                    Fulfillment Rate
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.15 }}>
                    {statRows.map((row) => (
                      <Box
                        key={row.label}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                          gap: 1,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          {row.label}
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.8rem' }}
                        >
                          {row.value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default RecruitmentOverviewSection;
