'use client';

import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';
import { aopCardOuterSx } from '../aop/aopStyles';
import type { SourcingNamedCount } from './sourcingDummyData';

interface SourcingBreakdownListProps {
  title: string;
  subtitle?: string;
  data: SourcingNamedCount[];
  loading?: boolean;
  unitLabel?: string;
  /** Single bar color (AOP Terms of Payment style). */
  barColor?: string;
  /** `card` = standalone (default). `embedded` = nested list without outer card. */
  variant?: 'card' | 'embedded';
}

const DEFAULT_BAR_COLOR = '#F59E0B';

const SourcingBreakdownList = ({
  title,
  subtitle,
  data,
  loading = false,
  unitLabel = 'roles',
  barColor = DEFAULT_BAR_COLOR,
  variant = 'card',
}: SourcingBreakdownListProps) => {
  const { rows, total } = useMemo(() => {
    const totalValue = data.reduce((sum, row) => sum + row.value, 0);
    return {
      total: totalValue,
      rows: data.map((row) => ({
        label: row.label,
        value: row.value,
        pct: totalValue > 0 ? (row.value / totalValue) * 100 : 0,
      })),
    };
  }, [data]);

  const progressRows = (
    <Stack spacing={variant === 'card' ? 2 : 1.25}>
      {rows.map((row) => (
        <Box key={row.label}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 2,
              mb: variant === 'card' ? 0.75 : 0.4,
            }}
          >
            <Typography
              variant={variant === 'card' ? 'body1' : 'body2'}
              sx={{ fontWeight: 600, minWidth: variant === 'card' ? 72 : undefined }}
              noWrap={variant === 'embedded'}
            >
              {row.label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <Typography
                variant={variant === 'card' ? 'body1' : 'body2'}
                sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
                color={variant === 'embedded' ? 'text.secondary' : undefined}
              >
                {row.value.toLocaleString('en-US')}
                {variant === 'embedded' ? ` (${row.pct.toFixed(1)}%)` : ''}
              </Typography>
              {variant === 'card' && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ width: 56, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
                >
                  {row.pct.toFixed(1)}%
                </Typography>
              )}
            </Box>
          </Box>
          <LinearProgress
            variant="determinate"
            value={row.pct}
            sx={{
              height: variant === 'card' ? 10 : 8,
              borderRadius: 1,
              backgroundColor: (t) =>
                t.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 1,
                backgroundColor: barColor,
              },
            }}
          />
        </Box>
      ))}
    </Stack>
  );

  if (variant === 'embedded') {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.25 }}>
          {title}
        </Typography>
        {progressRows}
      </Box>
    );
  }

  return (
    <Card
      sx={(t) => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...aopCardOuterSx(t),
      })}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', '&:last-child': { pb: 2 } }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {subtitle}
          </Typography>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, py: 8 }}>
            <CircularProgress />
          </Box>
        ) : rows.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, py: 8 }}>
            <Typography color="text.secondary">No data for this period</Typography>
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Total: {total.toLocaleString('en-US')} {unitLabel}
            </Typography>
            {progressRows}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SourcingBreakdownList;
