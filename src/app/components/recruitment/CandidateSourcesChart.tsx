'use client';

import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { CandidateSourceSlice } from '../../api/recruitment/RecruitmentSlice';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const SOURCE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899'];

interface CandidateSourcesChartProps {
  data: CandidateSourceSlice[];
  loading?: boolean;
}

const CandidateSourcesChart = ({ data, loading = false }: CandidateSourcesChartProps) => {
  const theme = useTheme();
  const labels = data.map((d) => d.label);
  const series = data.map((d) => d.count);
  const total = useMemo(() => series.reduce((sum, n) => sum + n, 0), [series]);

  const chartOptions: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: 'donut',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873',
        toolbar: { show: false },
      },
      labels,
      colors: SOURCE_COLORS,
      stroke: { width: 2, colors: [theme.palette.background.paper] },
      dataLabels: { enabled: false },
      legend: { show: false },
      plotOptions: {
        pie: {
          donut: {
            size: '72%',
            labels: { show: false },
          },
        },
      },
      states: {
        hover: { filter: { type: 'lighten', value: 0.08 } },
      },
      tooltip: {
        theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
        y: {
          formatter: (val: number, opts) => {
            const pct = opts.w.globals.seriesPercent[opts.seriesIndex]?.[0] ?? 0;
            return `${val.toLocaleString('en-US')} (${pct.toFixed(1)}%)`;
          },
        },
      },
    }),
    [labels, theme.palette.mode, theme.palette.background.paper]
  );

  return (
    <Box
      sx={{
        flex: 1,
        height: '100%',
        minHeight: { xs: 320, lg: '100%' },
        display: 'flex',
        flexDirection: 'column',
        p: 2.5,
        minWidth: 0,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, flexShrink: 0 }}>
        Candidate Sources
      </Typography>

      {loading ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={24} />
        </Box>
      ) : data.length === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="text.secondary">No source data for the selected filters</Typography>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ width: '100%', maxWidth: 300, flex: 1, maxHeight: 300, minHeight: 200 }}>
              <ReactApexChart options={chartOptions} series={series} type="donut" height={280} width="100%" />
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none',
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={600}
                sx={{ fontSize: '0.9375rem', mb: 0.25 }}
              >
                Total
              </Typography>
              <Typography
                fontWeight={700}
                lineHeight={1.1}
                sx={{ fontSize: { xs: '2rem', sm: '2.35rem' } }}
              >
                {total.toLocaleString('en-US')}
              </Typography>
            </Box>
          </Box>
          <Stack
            direction="row"
            flexWrap="wrap"
            justifyContent="center"
            gap={1.5}
            sx={{ mt: 1.5, flexShrink: 0 }}
          >
            {data.map((item, index) => (
              <Stack key={item.label} direction="row" alignItems="center" spacing={0.75}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: SOURCE_COLORS[index % SOURCE_COLORS.length],
                    flexShrink: 0,
                  }}
                />
                <Typography variant="body2" fontWeight={500}>
                  {item.label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
};

export default CandidateSourcesChart;
