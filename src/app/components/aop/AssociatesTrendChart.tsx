'use client';

import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { AopAssociatesTrend, AopTrendMetric } from '../../api/aop/AopSlice';
import { aopCardOuterSx } from './aopStyles';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface AssociatesTrendChartProps {
  data: AopAssociatesTrend;
  loading?: boolean;
}

const AssociatesTrendChart = ({ data, loading = false }: AssociatesTrendChartProps) => {
  const theme = useTheme();
  const enabledMetrics = useMemo(
    () => data.metric_options.filter((option) => option.enabled),
    [data.metric_options],
  );

  const [metric, setMetric] = useState<AopTrendMetric>('total_associates_on_payroll');

  useEffect(() => {
    const isCurrentEnabled = enabledMetrics.some((option) => option.key === metric);
    if (!isCurrentEnabled && enabledMetrics.length > 0) {
      setMetric(enabledMetrics[0].key);
    }
  }, [enabledMetrics, metric]);

  const seriesData = data.series[metric] ?? [];
  const metricLabel = data.metric_options.find((option) => option.key === metric)?.label ?? '';
  const hasData = data.categories.length > 0 && seriesData.length > 0;

  const chartOptions: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: 'line',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873',
        toolbar: { show: true },
        zoom: { enabled: false },
      },
      stroke: { curve: 'smooth', width: 3 },
      colors: ['#0D9488'],
      markers: { size: 5, strokeColors: '#fff', strokeWidth: 2 },
      xaxis: {
        categories: data.categories,
        labels: { style: { fontSize: '12px' }, rotate: -45 },
      },
      yaxis: {
        labels: {
          formatter: (val: number) => val.toLocaleString('en-US'),
        },
      },
      grid: { borderColor: theme.palette.divider, strokeDashArray: 4 },
      tooltip: {
        y: { formatter: (val: number) => val.toLocaleString('en-US') },
      },
    }),
    [theme, data.categories],
  );

  const handleMetricChange = (event: SelectChangeEvent<AopTrendMetric>) => {
    setMetric(event.target.value as AopTrendMetric);
  };

  return (
    <Card sx={(t) => ({ ...aopCardOuterSx(t) })}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 2,
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
              Associates Trend
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Month-to-month associate metrics.
            </Typography>
          </Box>

          {enabledMetrics.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 260 }}>
              <InputLabel>Metric</InputLabel>
              <Select value={metric} label="Metric" onChange={handleMetricChange}>
                {enabledMetrics.map((option) => (
                  <MenuItem key={option.key} value={option.key}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>

        <Box sx={{ height: 380, position: 'relative' }}>
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : hasData ? (
            <ReactApexChart
              options={chartOptions}
              series={[{ name: metricLabel, data: seriesData }]}
              type="line"
              height={360}
            />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography color="text.secondary">No trend data available</Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default AssociatesTrendChart;
