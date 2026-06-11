'use client';

import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CandidateSourceSlice } from '../../api/recruitment/RecruitmentSlice';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const SOURCE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899'];

interface CandidateSourcesChartProps {
  data: CandidateSourceSlice[];
  loading?: boolean;
}

const CandidateSourcesChart = ({ data, loading = false }: CandidateSourcesChartProps) => {
  const theme = useTheme();
  const [hiddenLabels, setHiddenLabels] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setHiddenLabels(new Set());
  }, [data]);

  const colorByLabel = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((item, index) => {
      map.set(item.label, SOURCE_COLORS[index % SOURCE_COLORS.length]);
    });
    return map;
  }, [data]);

  const visibleData = useMemo(
    () => data.filter((item) => !hiddenLabels.has(item.label)),
    [data, hiddenLabels]
  );

  const toggleSource = useCallback(
    (label: string) => {
      setHiddenLabels((prev) => {
        const isHidden = prev.has(label);
        if (!isHidden) {
          const visibleCount = data.filter((item) => !prev.has(item.label)).length;
          if (visibleCount <= 1) return prev;
        }
        const next = new Set(prev);
        if (isHidden) next.delete(label);
        else next.add(label);
        return next;
      });
    },
    [data]
  );

  const resetView = useCallback(() => setHiddenLabels(new Set()), []);

  const labels = visibleData.map((d) => d.label);
  const series = visibleData.map((d) => d.count);
  const colors = visibleData.map((d) => colorByLabel.get(d.label) ?? SOURCE_COLORS[0]);
  const visibleTotal = useMemo(() => series.reduce((sum, n) => sum + n, 0), [series]);

  const chartOptions: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: 'donut',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        foreColor: theme.palette.mode === 'dark' ? '#adb0bb' : '#5e5873',
        toolbar: { show: false },
        selection: { enabled: true },
        events: {
          dataPointSelection: (_event, _chartContext, config) => {
            const label = visibleData[config.dataPointIndex]?.label;
            if (label) toggleSource(label);
          },
        },
      },
      labels,
      colors,
      stroke: { width: 2, colors: [theme.palette.background.paper] },
      dataLabels: { enabled: false },
      legend: { show: false },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: '72%',
            labels: { show: false },
          },
        },
      },
      states: {
        hover: { filter: { type: 'lighten', value: 0.08 } },
        active: { filter: { type: 'none' } },
      },
      tooltip: {
        enabled: true,
        theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
        fillSeriesColor: false,
        y: {
          formatter: (val: number) => {
            const pct = visibleTotal > 0 ? ((val / visibleTotal) * 100).toFixed(1) : '0.0';
            return `${val.toLocaleString('en-US')} (${pct}%)`;
          },
        },
      },
    }),
    [labels, colors, visibleTotal, toggleSource, visibleData, theme.palette.mode, theme.palette.background.paper]
  );

  return (
    <Box
      sx={{
        flex: 1,
        height: '100%',
        minHeight: { xs: 320, lg: '100%' },
        display: 'flex',
        flexDirection: 'column',
        p: 2.5,
        minWidth: 0,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 2, flexShrink: 0 }}>
        <Box>
          <Typography variant="h6">Candidate Sources</Typography>
          <Typography variant="caption" color="text.secondary">
            Click a slice or source to hide it
          </Typography>
        </Box>
        {hiddenLabels.size > 0 && (
          <Button size="small" variant="text" onClick={resetView} sx={{ flexShrink: 0, minWidth: 'auto' }}>
            Reset
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={24} />
        </Box>
      ) : data.length === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="text.secondary">No source data for the selected filters</Typography>
        </Box>
      ) : visibleData.length === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Typography color="text.secondary">All sources hidden</Typography>
          <Button size="small" variant="outlined" onClick={resetView}>
            Reset view
          </Button>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'visible',
              cursor: 'pointer',
            }}
          >
            <Box sx={{ width: '100%', maxWidth: 300, flex: 1, maxHeight: 300, minHeight: 200, overflow: 'visible' }}>
              <ReactApexChart
                key={labels.join('|')}
                options={chartOptions}
                series={series}
                type="donut"
                height={280}
                width="100%"
              />
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={600}
                sx={{ fontSize: '0.9375rem', mb: 0.25 }}
              >
                Total
              </Typography>
              <Typography
                fontWeight={700}
                lineHeight={1.1}
                sx={{ fontSize: { xs: '2rem', sm: '2.35rem' } }}
              >
                {visibleTotal.toLocaleString('en-US')}
              </Typography>
            </Box>
          </Box>
          <Stack
            direction="row"
            flexWrap="wrap"
            justifyContent="center"
            gap={1.5}
            sx={{ mt: 1.5, flexShrink: 0 }}
          >
            {data.map((item) => {
              const isHidden = hiddenLabels.has(item.label);
              const color = colorByLabel.get(item.label) ?? SOURCE_COLORS[0];
              return (
                <Stack
                  key={item.label}
                  direction="row"
                  alignItems="center"
                  spacing={0.75}
                  onClick={() => toggleSource(item.label)}
                  sx={{
                    cursor: 'pointer',
                    opacity: isHidden ? 0.45 : 1,
                    textDecoration: isHidden ? 'line-through' : 'none',
                    borderRadius: 1,
                    px: 0.5,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: color,
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="body2" fontWeight={500}>
                    {item.label}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        </>
      )}
    </Box>
  );
};

export default CandidateSourcesChart;
