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

const SHORT_LABELS = SEGMENTS.map((s) => s.short);
const COLORS = ['#0D9488', '#0891B2', '#6366F1', '#94A3B8'];

const PayrollCompositionSection = ({ data, loading = false }: PayrollCompositionSectionProps) => {
  const theme = useTheme();
  const values = [
    data.regular_payroll,
    data.regular_payroll_with_compensation,
    data.compensation_only,
    data.unmapped,
  ];
  const total = values.reduce((sum, v) => sum + v, 0);

  const chartOptions: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: 'donut',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873',
      },
      labels: SHORT_LABELS,
      colors: COLORS,
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
          const label = SEGMENTS[seriesIndex]?.full ?? '';
          const value = series[seriesIndex] ?? 0;
          return `<div class="arrow-box" style="padding:8px 12px">
            <div style="font-weight:600;margin-bottom:4px">${label}</div>
            <div>${value.toLocaleString('en-US')} associates</div>
          </div>`;
        },
      },
    }),
    [theme, total],
  );

  return (
    <Card sx={(t) => ({ height: '100%', ...aopCardOuterSx(t) })}>
      <CardContent>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
          Payroll Composition
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Breakdown by payment type received by associates.
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <ReactApexChart options={chartOptions} series={values} type="donut" height={360} />
        )}
      </CardContent>
    </Card>
  );
};

export default PayrollCompositionSection;
