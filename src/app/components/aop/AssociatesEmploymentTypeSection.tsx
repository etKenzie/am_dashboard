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
  hideZeroValues?: boolean;
}

const LABELS = [
  'PKWT Associates',
  'PKWTT Associates',
  'Mitra Associates',
  'DW Associates',
  'Unmapped Associates',
];
const COLORS = ['#43A047', '#FBC02D', '#E53935', '#1E88E5', '#8E24AA'];

const AssociatesEmploymentTypeSection = ({
  data,
  loading = false,
  hideZeroValues = false,
}: AssociatesEmploymentTypeSectionProps) => {
  const theme = useTheme();
  const chartItems = useMemo(() => {
    const items = [
      { label: LABELS[0], value: data.pkwt, color: COLORS[0] },
      { label: LABELS[1], value: data.pkwtt, color: COLORS[1] },
      { label: LABELS[2], value: data.mitra, color: COLORS[2] },
      { label: LABELS[3], value: data.dw, color: COLORS[3] },
      { label: LABELS[4], value: data.unmapped, color: COLORS[4] },
    ];
    return hideZeroValues ? items.filter((item) => item.value !== 0) : items;
  }, [data, hideZeroValues]);

  const values = chartItems.map((item) => item.value);
  const labels = chartItems.map((item) => item.label);
  const colors = chartItems.map((item) => item.color);
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
      colors,
      dataLabels: {
        enabled: true,
        formatter: (val: number) => val.toLocaleString('en-US'),
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
        y: { formatter: (val: number) => `${val.toLocaleString('en-US')} associates` },
      },
    }),
    [theme, labels, colors],
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
        ) : values.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <Typography color="text.secondary">No employment type data for this period</Typography>
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
