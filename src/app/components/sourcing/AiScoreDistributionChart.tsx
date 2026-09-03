'use client';

import { Box, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { aopCardOuterSx } from '../aop/aopStyles';
import type { SourcingNamedCount } from './sourcingDummyData';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface AiScoreDistributionChartProps {
  data: SourcingNamedCount[];
  avgAiScore?: number;
  loading?: boolean;
}

const BAR_COLORS = ['#E53935', '#FB8C00', '#1E88E5', '#0D9488'];

/** Bands whose lower bound is >= 61 count as high-quality CVs. */
function isHighQualityBand(label: string): boolean {
  const match = label.trim().match(/^(\d+)/);
  if (!match) return false;
  return Number(match[1]) >= 61;
}

const AiScoreDistributionChart = ({
  data,
  avgAiScore = 0,
  loading = false,
}: AiScoreDistributionChartProps) => {
  const theme = useTheme();

  const ordered = useMemo(() => [...data].reverse(), [data]);
  const labels = ordered.map((row) => row.label);
  const values = ordered.map((row) => row.value);
  const colors = ordered.map((_, index) => {
    const sourceIndex = data.length - 1 - index;
    return BAR_COLORS[sourceIndex % BAR_COLORS.length];
  });
  const total = values.reduce((sum, value) => sum + value, 0);
  const highQualityCount = data
    .filter((row) => isHighQualityBand(row.label))
    .reduce((sum, row) => sum + row.value, 0);
  const highQualityPct = total > 0 ? (highQualityCount / total) * 100 : 0;

  const chartOptions: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: 'bar',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873',
        toolbar: { show: false },
        parentHeightOffset: 0,
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 6,
          barHeight: '55%',
          distributed: true,
        },
      },
      colors,
      dataLabels: {
        enabled: true,
        formatter: (val: number) => {
          const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
          return `${val.toLocaleString('en-US')} (${pct}%)`;
        },
        style: { fontSize: '12px', fontWeight: 600 },
      },
      xaxis: {
        categories: labels,
        labels: { formatter: (val: string) => Number(val).toLocaleString('en-US') },
      },
      yaxis: { labels: { style: { fontSize: '12px' } } },
      legend: { show: false },
      grid: { borderColor: theme.palette.divider, strokeDashArray: 4 },
      tooltip: {
        y: {
          formatter: (val: number) => {
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
            return `${val.toLocaleString('en-US')} CVs (${pct}%)`;
          },
        },
      },
    }),
    [theme, labels, colors, total],
  );

  return (
    <Card
      sx={(t) => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...aopCardOuterSx(t),
      })}
    >
      <CardContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          '&:last-child': { pb: 2 },
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
          AI Score Distribution
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          CV count by AI score band for the selected period.
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, py: 8 }}>
            <CircularProgress />
          </Box>
        ) : values.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, py: 8 }}>
            <Typography color="text.secondary">No AI score data for this period</Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ flex: 1, minHeight: 320, display: 'flex', flexDirection: 'column' }}>
              <ReactApexChart
                options={chartOptions}
                series={[{ name: 'CVs', data: values }]}
                type="bar"
                height={320}
              />
            </Box>

            <Box
              sx={{
                mt: 2.5,
                pt: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{ fontVariantNumeric: 'tabular-nums', color: '#2563EB' }}
                >
                  {total.toLocaleString('en-US')}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mt: 0.5 }}>
                  Total CVs
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{ fontVariantNumeric: 'tabular-nums', color: '#7C3AED' }}
                >
                  {avgAiScore.toLocaleString('en-US', {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mt: 0.5 }}>
                  Avg AI Score
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{ fontVariantNumeric: 'tabular-nums', color: '#0D9488' }}
                >
                  {highQualityPct.toLocaleString('en-US', {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}
                  %
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mt: 0.5 }}>
                  High Quality CV (61+)
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AiScoreDistributionChart;
