'use client';

import { Box, Card, CardContent, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export interface GenderPieItem {
  label: string;
  value: number;
  color: string;
}

interface GenderPieChartProps {
  data?: GenderPieItem[];
}

const GENDER_COLORS: Record<string, string> = {
  Male: '#2563EB',
  Female: '#EC4899',
  Unknown: '#64748B',
};

const FALLBACK_COLORS = ['#2563EB', '#EC4899', '#64748B', '#D97706'];

export function mapGenderItems(
  items: Array<{ gender_name: string; total_count: number }> | undefined,
): GenderPieItem[] {
  if (!items?.length) return [];
  return items
    .filter((item) => (item.total_count ?? 0) > 0)
    .map((item, index) => {
      const label = item.gender_name || 'Unknown';
      return {
        label,
        value: item.total_count ?? 0,
        color: GENDER_COLORS[label] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length],
      };
    });
}

const titleSx = {
  fontWeight: 700,
  fontSize: '1.15rem',
  color: 'text.primary',
  mb: 0.5,
};

const GenderPieChart = ({ data = [] }: GenderPieChartProps) => {
  const theme = useTheme();
  const labels = data.map((row) => row.label);
  const series = data.map((row) => row.value);
  const colors = data.map((row) => row.color);

  const chartOptions: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: 'pie',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873',
        toolbar: { show: false },
      },
      labels,
      colors,
      stroke: { width: 2, colors: [theme.palette.background.paper] },
      legend: {
        show: true,
        position: 'bottom',
        fontWeight: 600,
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${Number(val).toFixed(0)}%`,
        style: { fontSize: '12px', fontWeight: 700 },
      },
      tooltip: {
        y: {
          formatter: (val: number) => Number(val).toLocaleString('en-US'),
        },
      },
      noData: { text: 'No gender data' },
    }),
    [theme, labels, colors],
  );

  return (
    <Card
      sx={(t) => ({
        height: '100%',
        border: '1px solid',
        borderColor: t.palette.mode === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)',
        boxShadow: t.palette.mode === 'dark' ? 'none' : '0 1px 4px rgba(0, 0, 0, 0.06)',
      })}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography sx={titleSx}>Gender</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Male to female borrower ratio
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <ReactApexChart
            key={labels.join('|')}
            options={chartOptions}
            series={series}
            type="pie"
            height={360}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default GenderPieChart;
