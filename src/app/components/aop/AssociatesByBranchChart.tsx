'use client';

import { Box, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { AopAssociatesByBranch } from '../../api/aop/AopSlice';
import { aopCardOuterSx } from './aopStyles';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface AssociatesByBranchChartProps {
  data: AopAssociatesByBranch[];
  loading?: boolean;
  hideZeroValues?: boolean;
}

const BAR_COLOR = '#0D9488';

const AssociatesByBranchChart = ({
  data,
  loading = false,
  hideZeroValues = false,
}: AssociatesByBranchChartProps) => {
  const theme = useTheme();

  const chartItems = useMemo(() => {
    const items = hideZeroValues ? data.filter((row) => row.total_associates !== 0) : data;
    return items;
  }, [data, hideZeroValues]);

  const labels = chartItems.map((row) => row.branch);
  const values = chartItems.map((row) => row.total_associates);
  const total = values.reduce((sum, value) => sum + value, 0);
  const chartHeight = Math.max(360, labels.length * 28);

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
          borderRadius: 4,
          barHeight: '70%',
          distributed: false,
        },
      },
      colors: [BAR_COLOR],
      dataLabels: {
        enabled: true,
        formatter: (val: number) => val.toLocaleString('en-US'),
        style: { fontSize: '11px', fontWeight: 600 },
      },
      xaxis: {
        categories: labels,
        labels: { formatter: (val: string) => Number(val).toLocaleString('en-US') },
      },
      yaxis: {
        labels: {
          style: { fontSize: '12px' },
          maxWidth: 140,
        },
      },
      legend: { show: false },
      grid: { borderColor: theme.palette.divider, strokeDashArray: 4 },
      tooltip: {
        y: { formatter: (val: number) => `${val.toLocaleString('en-US')} associates` },
      },
    }),
    [theme, labels],
  );

  return (
    <Card sx={(t) => ({ ...aopCardOuterSx(t) })}>
      <CardContent>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
          Associates by Branch
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Headcount breakdown across all branches for the selected period.
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : values.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <Typography color="text.secondary">No branch data for this period</Typography>
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Total: {total.toLocaleString('en-US')} associates across {labels.length} branches
            </Typography>
            <ReactApexChart
              options={chartOptions}
              series={[{ name: 'Associates', data: values }]}
              type="bar"
              height={chartHeight}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AssociatesByBranchChart;
