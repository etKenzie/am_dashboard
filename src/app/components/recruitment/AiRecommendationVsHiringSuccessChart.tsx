'use client';

import { Box, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { AiVsHiringSuccessMetrics } from '../../api/recruitment/RecruitmentSlice';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

/** Match AI recommended ring and growth chart purples */
const BAR_AI_RECOMMENDATION = '#7C3AED';
const BAR_HIRING_SUCCESS = '#A78BFA';

interface AiRecommendationVsHiringSuccessChartProps {
  data: AiVsHiringSuccessMetrics | undefined;
  loading?: boolean;
}

const Y_AXIS_TICK_COUNT = 5;

/** At most 5 y-axis labels, each a multiple of 10 */
function getYAxisScale(maxValue: number) {
  const intervals = Y_AXIS_TICK_COUNT - 1;
  if (maxValue <= 0) {
    return { min: 0, max: 40, tickAmount: intervals };
  }
  const step = Math.ceil(maxValue / intervals / 10) * 10;
  const max = step * intervals;
  return { min: 0, max, tickAmount: intervals };
}

const AiRecommendationVsHiringSuccessChart = ({
  data,
  loading = false,
}: AiRecommendationVsHiringSuccessChartProps) => {
  const theme = useTheme();

  const ai = data?.ai_recommendation ?? 0;
  const hiring = data?.hiring_success ?? 0;
  const combined = ai + hiring;
  const pctDenom = data?.tooltip_percent_denominator;

  const categories = ['AI Recommendation', 'Hiring Success'];
  const series = [
    {
      name: 'Count',
      data: [ai, hiring],
    },
  ];

  const yScale = useMemo(() => getYAxisScale(Math.max(ai, hiring)), [ai, hiring]);

  const chartOptions: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: 'bar',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873',
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '42%',
          borderRadius: 6,
          borderRadiusApplication: 'end',
          distributed: true,
        },
      },
      colors: [BAR_AI_RECOMMENDATION, BAR_HIRING_SUCCESS],
      dataLabels: { enabled: false },
      legend: { show: false },
      grid: {
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.08)',
        strokeDashArray: 3,
        xaxis: { lines: { show: false } },
      },
      xaxis: {
        categories,
        labels: {
          style: {
            colors: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873',
            fontSize: '12px',
            fontWeight: 500,
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        min: yScale.min,
        max: yScale.max,
        tickAmount: yScale.tickAmount,
        forceNiceScale: false,
        labels: {
          style: { colors: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873' },
          formatter: (val: number) => {
            const v = Math.round(val);
            if (v % 10 !== 0) return '';
            return v.toLocaleString('en-US');
          },
        },
      },
      tooltip: {
        theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
        y: {
          formatter: (val: number) => {
            const num = Number(val);
            const denom =
              pctDenom != null && pctDenom > 0 ? pctDenom : combined > 0 ? combined : 0;
            const pct = denom > 0 ? (num / denom) * 100 : 0;
            const formatted = num.toLocaleString('en-US', { maximumFractionDigits: 1 });
            return `${formatted} (${pct.toFixed(1)}%)`;
          },
        },
      },
    }),
    [theme.palette.mode, combined, pctDenom, yScale]
  );

  const hasData = data != null;

  return (
    <Box
      sx={{
        flex: 1,
        height: '100%',
        minHeight: { xs: 200, lg: '100%' },
        display: 'flex',
        flexDirection: 'column',
        p: 2.5,
        minWidth: 0,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, flexShrink: 0 }}>
        AI recommendation vs Hiring Success
      </Typography>

      <Box sx={{ flex: 1, minHeight: 200, position: 'relative' }}>
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <CircularProgress size={24} />
          </Box>
        ) : !hasData ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography color="text.secondary">No data for the selected filters</Typography>
          </Box>
        ) : (
          <ReactApexChart options={chartOptions} series={series} type="bar" height={220} />
        )}
      </Box>
    </Box>
  );
};

export default AiRecommendationVsHiringSuccessChart;
