'use client';

import { Box, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { AopEmploymentType } from '../../api/aop/AopSlice';
import { aopCardOuterSx } from './aopStyles';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface AssociatesEmploymentTypeSectionProps {
  data: AopEmploymentType;
  loading?: boolean;
}

const LABELS = [
  'PKWT Associates',
  'PKWTT Associates',
  'Mitra Associates',
  'DW Associates',
  'Unmapped Associates',
];
const COLORS = ['#0D9488', '#14B8A6', '#2DD4BF', '#5EEAD4', '#94A3B8'];

const AssociatesEmploymentTypeSection = ({
  data,
  loading = false,
}: AssociatesEmploymentTypeSectionProps) => {
  const theme = useTheme();
  const values = [data.pkwt, data.pkwtt, data.mitra, data.dw, data.unmapped];
  const total = values.reduce((sum, v) => sum + v, 0);

  const chartOptions: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: 'bar',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873',
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 6,
          barHeight: '55%',
          distributed: true,
        },
      },
      colors: COLORS,
      dataLabels: {
        enabled: true,
        formatter: (val: number) => val.toLocaleString('en-US'),
        style: { fontSize: '12px', fontWeight: 600 },
      },
      xaxis: {
        categories: LABELS,
        labels: { formatter: (val: string) => Number(val).toLocaleString('en-US') },
      },
      yaxis: { labels: { style: { fontSize: '12px' } } },
      legend: { show: false },
      grid: { borderColor: theme.palette.divider, strokeDashArray: 4 },
      tooltip: {
        y: { formatter: (val: number) => `${val.toLocaleString('en-US')} associates` },
      },
    }),
    [theme],
  );

  return (
    <Card sx={(t) => ({ height: '100%', ...aopCardOuterSx(t) })}>
      <CardContent>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
          Associates Employment Type
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Breakdown of associates processed on payroll by contract type.
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Total: {total.toLocaleString('en-US')} associates
            </Typography>
            <ReactApexChart
              options={chartOptions}
              series={[{ name: 'Associates', data: values }]}
              type="bar"
              height={320}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AssociatesEmploymentTypeSection;
