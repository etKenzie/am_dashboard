'use client';

import { Box, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { AopAssociatesByRoleGrouping } from '../../api/aop/AopSlice';
import AopOtherCategoriesPanel from './AopOtherCategoriesPanel';
import { splitTopNHeadcount } from './aopChartHelpers';
import { aopCardOuterSx } from './aopStyles';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface AssociatesByRoleGroupingChartProps {
  data: AopAssociatesByRoleGrouping[];
  loading?: boolean;
  hideZeroValues?: boolean;
}

const BAR_COLOR = '#6366F1';

const AssociatesByRoleGroupingChart = ({
  data,
  loading = false,
  hideZeroValues = false,
}: AssociatesByRoleGroupingChartProps) => {
  const theme = useTheme();

  const { chartItems, otherItems, otherTotal, total, allCount } = useMemo(() => {
    const filtered = hideZeroValues ? data.filter((row) => row.total_associates !== 0) : data;
    const categories = filtered.map((row) => ({
      label: row.role_grouping_name,
      value: row.total_associates,
    }));
    const split = splitTopNHeadcount(categories);
    const totalValue = categories.reduce((sum, row) => sum + row.value, 0);
    return {
      ...split,
      total: totalValue,
      allCount: categories.length,
    };
  }, [data, hideZeroValues]);

  // chartItems are sorted largest → smallest; Apex places the first category at the top.
  const labels = chartItems.map((row) => row.label);
  const values = chartItems.map((row) => row.value);
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
          maxWidth: 180,
        },
      },
      legend: { show: false },
      grid: { borderColor: theme.palette.divider, strokeDashArray: 4 },
      tooltip: {
        y: {
          formatter: (val: number) => {
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
            return `${val.toLocaleString('en-US')} associates (${pct}%)`;
          },
        },
      },
    }),
    [theme, labels, total],
  );

  return (
    <Card sx={(t) => ({ ...aopCardOuterSx(t) })}>
      <CardContent>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
          Associates by Role Grouping
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Headcount breakdown across role groupings for the selected period.
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : values.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <Typography color="text.secondary">No role grouping data for this period</Typography>
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Total: {total.toLocaleString('en-US')} associates across {allCount} role groupings
            </Typography>
            <ReactApexChart
              options={chartOptions}
              series={[{ name: 'Associates', data: values }]}
              type="bar"
              height={chartHeight}
            />
            <AopOtherCategoriesPanel
              items={otherItems}
              otherTotal={otherTotal}
              total={total}
              categoryHeader="Role grouping"
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AssociatesByRoleGroupingChart;
