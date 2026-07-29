'use client';

import { Box, Card, CardContent, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export interface TopRejectReasonItem {
  reason: string;
  count: number;
  color: string;
}

interface TopRejectReasonChartProps {
  data?: TopRejectReasonItem[];
}

/** Same palette as Demography Loaner Age Range */
const REJECT_COLORS = ['#2563EB', '#16A34A', '#D97706', '#7C3AED', '#DC2626', '#64748B'];

export function mapRejectReasons(
  items: Array<{ reject_reason_name: string; total_count: number }> | undefined,
): TopRejectReasonItem[] {
  if (!items?.length) return [];
  return items.map((item, index) => ({
    reason: item.reject_reason_name || 'Unknown',
    count: item.total_count ?? 0,
    color: REJECT_COLORS[index % REJECT_COLORS.length],
  }));
}

const titleSx = {
  fontWeight: 700,
  fontSize: '1.15rem',
  color: 'text.primary',
  mb: 0.5,
};

const TopRejectReasonChart = ({ data = [] }: TopRejectReasonChartProps) => {
  const theme = useTheme();
  const [hiddenReasons, setHiddenReasons] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setHiddenReasons(new Set());
  }, [data]);

  const visibleData = useMemo(
    () => data.filter((item) => !hiddenReasons.has(item.reason)),
    [data, hiddenReasons],
  );

  const values = visibleData.map((row) => row.count);
  const colors = visibleData.map((row) => row.color);
  const categories = visibleData.map((row) => row.reason);

  const toggleReason = useCallback(
    (reason: string) => {
      setHiddenReasons((prev) => {
        const isHidden = prev.has(reason);
        if (!isHidden) {
          const visibleCount = data.filter((item) => !prev.has(item.reason)).length;
          if (visibleCount <= 1) return prev;
        }
        const next = new Set(prev);
        if (isHidden) next.delete(reason);
        else next.add(reason);
        return next;
      });
    },
    [data],
  );

  const chartOptions: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: 'bar',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873',
        toolbar: { show: false },
        animations: { enabled: false },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 4,
          columnWidth: '55%',
          distributed: true,
        },
      },
      colors,
      dataLabels: {
        enabled: true,
        formatter: (val: number) => Number(val).toLocaleString('en-US'),
        style: { fontSize: '11px', fontWeight: 600 },
        offsetY: -2,
      },
      xaxis: {
        categories,
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          formatter: (val: number) => Number(val).toLocaleString('en-US'),
          style: { fontSize: '12px' },
        },
      },
      legend: { show: false },
      grid: { borderColor: theme.palette.divider, strokeDashArray: 4 },
      tooltip: {
        y: {
          formatter: (val: number) => `${Number(val).toLocaleString('en-US')} requests`,
        },
      },
      noData: { text: 'No reject reason data' },
    }),
    [theme, colors, categories],
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
        <Typography sx={titleSx}>Top Reject Reason</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Rejected requests by reason
        </Typography>
        <ReactApexChart
          key={categories.join('|')}
          options={chartOptions}
          series={[{ name: 'Rejected', data: values }]}
          type="bar"
          height={280}
        />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 2,
            mt: 0.5,
          }}
        >
          {data.map((item) => {
            const isHidden = hiddenReasons.has(item.reason);
            return (
              <Box
                key={item.reason}
                component="button"
                type="button"
                onClick={() => toggleReason(item.reason)}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  opacity: isHidden ? 0.4 : 1,
                  p: 0.25,
                  color: 'text.secondary',
                  fontFamily: 'inherit',
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: item.color,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ textDecoration: isHidden ? 'line-through' : 'none' }}
                >
                  {item.reason}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TopRejectReasonChart;
