'use client';

import { Box, Card, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { aopCardOuterSx } from '../aop/aopStyles';
import type { NewCandidateGrowthData } from './sourcingDummyData';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const PROCESSED_COLOR = '#2563EB';
const NOT_PROCESSED_COLOR = '#94A3B8';

interface NewCandidateGrowthSectionProps {
  data: NewCandidateGrowthData;
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

const NewCandidateGrowthSection = ({ data, loading = false }: NewCandidateGrowthSectionProps) => {
  const theme = useTheme();
  const total = data.total;
  const processedPct = total > 0 ? (data.processed / total) * 100 : 0;
  const notProcessedPct = total > 0 ? (data.not_processed / total) * 100 : 0;
  const categories = data.trend.map((row) => row.period_label);
  const processedSeries = data.trend.map((row) => row.processed);
  const notProcessedSeries = data.trend.map((row) => row.not_processed);
  const hasTrend = data.trend.some((row) => row.processed > 0 || row.not_processed > 0);

  const chartOptions: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: 'bar',
        stacked: true,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873',
        toolbar: { show: true },
        zoom: { enabled: false },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          borderRadius: 0,
          borderRadiusApplication: 'end',
        },
      },
      colors: [PROCESSED_COLOR, NOT_PROCESSED_COLOR],
      stroke: { width: 0 },
      dataLabels: { enabled: false },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'right',
        fontSize: '12px',
      },
      grid: {
        borderColor: theme.palette.divider,
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
      },
      xaxis: {
        categories,
        labels: { rotate: -35, style: { fontSize: '12px' } },
        axisBorder: { show: false },
      },
      yaxis: {
        labels: {
          formatter: (val: number) => Math.round(val).toLocaleString('en-US'),
        },
      },
      tooltip: {
        y: {
          formatter: (val: number) => val.toLocaleString('en-US'),
        },
      },
    }),
    [theme, categories],
  );

  return (
    <Box mt={4}>
      <Typography variant="h5" sx={{ mb: 2, mt: 0, fontWeight: 600 }}>
        New Candidate Growth
      </Typography>

      <Card sx={(t) => ({ overflow: 'hidden', borderRadius: 0, ...aopCardOuterSx(t) })}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            alignItems: 'stretch',
            minHeight: { lg: 360 },
          }}
        >
          <Box
            sx={{
              flex: { lg: '0 0 320px' },
              width: { lg: 320 },
              px: 3,
              py: 3,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <Typography color="text.secondary" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
              New Candidates
            </Typography>

            {loading ? (
              <CircularProgress size={28} />
            ) : (
              <>
                <Typography
                  fontWeight={800}
                  lineHeight={1.1}
                  sx={{ fontSize: { xs: '2.25rem', sm: '2.75rem' }, fontVariantNumeric: 'tabular-nums' }}
                >
                  {formatNumber(total)}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                      <Box sx={{ width: 8, height: 8, bgcolor: PROCESSED_COLOR, flexShrink: 0 }} />
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        Processed
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatNumber(data.processed)} ({formatPercent(processedPct)})
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      width: '100%',
                      height: 14,
                      bgcolor: theme.palette.mode === 'dark' ? '#374151' : '#E5E7EB',
                      background:
                        total > 0
                          ? `linear-gradient(to right, ${PROCESSED_COLOR} 0%, ${PROCESSED_COLOR} ${processedPct}%, ${NOT_PROCESSED_COLOR} ${processedPct}%, ${NOT_PROCESSED_COLOR} 100%)`
                          : undefined,
                    }}
                  />

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                      <Box sx={{ width: 8, height: 8, bgcolor: NOT_PROCESSED_COLOR, flexShrink: 0 }} />
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        Not Processed
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatNumber(data.not_processed)} ({formatPercent(notProcessedPct)})
                    </Typography>
                  </Box>
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
            }}
          />

          <Box sx={{ flex: 1, minWidth: 0, px: 3, py: 2.5, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              New Candidates Trend
            </Typography>
            <Box sx={{ flex: 1, minHeight: 280, position: 'relative' }}>
              {loading ? (
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CircularProgress />
                </Box>
              ) : hasTrend ? (
                <ReactApexChart
                  options={chartOptions}
                  series={[
                    { name: 'Processed', data: processedSeries },
                    { name: 'Not Processed', data: notProcessedSeries },
                  ]}
                  type="bar"
                  height={300}
                />
              ) : (
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No new candidate trend for this period</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default NewCandidateGrowthSection;
