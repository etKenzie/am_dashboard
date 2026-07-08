'use client';

import { Box, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { AopPayrollComposition } from '../../api/aop/AopSlice';
import { aopCardOuterSx } from './aopStyles';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface PayrollCompositionSectionProps {
  data: AopPayrollComposition;
  loading?: boolean;
  hideZeroValues?: boolean;
}

const SEGMENTS = [
  {
    short: 'Regular Payroll',
    full: 'Regular Payroll (Basic Salary + Allowance)',
  },
  {
    short: 'Regular + Comp',
    full: 'Regular Payroll + Compensation',
  },
  {
    short: 'Comp Only',
    full: 'Compensation Only',
  },
  {
    short: 'Unmapped',
    full: 'Unmapped Associates',
  },
] as const;


const COLORS = ['#1E88E5', '#43A047', '#FB8C00', '#8E24AA'];

const PayrollCompositionSection = ({
  data,
  loading = false,
  hideZeroValues = false,
}: PayrollCompositionSectionProps) => {
  const theme = useTheme();
  const chartItems = useMemo(() => {
    const items = [
      { segment: SEGMENTS[0], value: data.regular_payroll, color: COLORS[0] },
      { segment: SEGMENTS[1], value: data.regular_payroll_with_compensation, color: COLORS[1] },
      { segment: SEGMENTS[2], value: data.compensation_only, color: COLORS[2] },
      { segment: SEGMENTS[3], value: data.unmapped, color: COLORS[3] },
    ];
    return hideZeroValues ? items.filter((item) => item.value !== 0) : items;
  }, [data, hideZeroValues]);

  const values = chartItems.map((item) => item.value);
  const shortLabels = chartItems.map((item) => item.segment.short);
  const colors = chartItems.map((item) => item.color);
  const total = values.reduce((sum, v) => sum + v, 0);

  const chartOptions: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: 'donut',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873',
      },
      labels: shortLabels,
      colors,
      legend: { position: 'bottom', fontSize: '13px' },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val.toFixed(1)}%`,
      },
      plotOptions: {
        pie: {
          donut: {
            size: '62%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '14px',
                offsetY: -4,
              },
              value: {
                fontSize: '20px',
                fontWeight: 600,
                offsetY: 4,
              },
              total: {
                show: true,
                label: 'Total',
                fontSize: '14px',
                formatter: () => total.toLocaleString('en-US'),
              },
            },
          },
        },
      },
      tooltip: {
        custom: ({ series, seriesIndex }) => {
          const label = chartItems[seriesIndex]?.segment.full ?? '';
          const value = series[seriesIndex] ?? 0;
          return `<div class="arrow-box" style="padding:8px 12px">
            <div style="font-weight:600;margin-bottom:4px">${label}</div>
            <div>${value.toLocaleString('en-US')} associates</div>
          </div>`;
        },
      },
    }),
    [theme, total, shortLabels, colors, chartItems],
  );

  return (
    <Card sx={(t) => ({ height: '100%', ...aopCardOuterSx(t) })}>
      <CardContent>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
          Compensation and Benefit
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Breakdown by payment type received by associates.
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : values.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <Typography color="text.secondary">No compensation and benefit data for this period</Typography>
          </Box>
        ) : (
          <ReactApexChart options={chartOptions} series={values} type="donut" height={360} />
        )}
      </CardContent>
    </Card>
  );
};

export default PayrollCompositionSection;
