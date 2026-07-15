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
import { AopAssociatesByTermsOfPayment } from '../../api/aop/AopSlice';
import { aopCardOuterSx } from './aopStyles';

interface AssociatesByTermsOfPaymentChartProps {
  data: AopAssociatesByTermsOfPayment[];
  loading?: boolean;
  hideZeroValues?: boolean;
}

function formatTermsLabel(terms: string): string {
  const days = Number(terms);
  if (Number.isFinite(days)) {
    return `${days.toLocaleString('en-US')} day${days === 1 ? '' : 's'}`;
  }
  return terms;
}

function termsDays(terms: string): number {
  const days = Number(terms);
  return Number.isFinite(days) ? days : Number.POSITIVE_INFINITY;
}

const AssociatesByTermsOfPaymentChart = ({
  data,
  loading = false,
  hideZeroValues = false,
}: AssociatesByTermsOfPaymentChartProps) => {
  const { rows, total } = useMemo(() => {
    const filtered = hideZeroValues ? data.filter((row) => row.total_associates !== 0) : data;
    const sorted = [...filtered].sort(
      (a, b) => termsDays(a.terms_of_payment) - termsDays(b.terms_of_payment),
    );
    const totalValue = sorted.reduce((sum, row) => sum + row.total_associates, 0);

    return {
      total: totalValue,
      rows: sorted.map((row) => ({
        key: row.terms_of_payment,
        label: formatTermsLabel(row.terms_of_payment),
        value: row.total_associates,
        pct: totalValue > 0 ? (row.total_associates / totalValue) * 100 : 0,
      })),
    };
  }, [data, hideZeroValues]);

  return (
    <Card sx={(t) => ({ ...aopCardOuterSx(t) })}>
      <CardContent>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
          Associates by Terms of Payment
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Headcount broken down by client payment terms for the selected period.
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : rows.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <Typography color="text.secondary">No terms of payment data for this period</Typography>
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Total: {total.toLocaleString('en-US')} associates across {rows.length} payment terms
            </Typography>

            <Stack spacing={2}>
              {rows.map((row) => (
                <Box key={row.key}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      gap: 2,
                      mb: 0.75,
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 600, minWidth: 88 }}>
                      {row.label}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                        {row.value.toLocaleString('en-US')}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ width: 56, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
                      >
                        {row.pct.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={row.pct}
                    sx={{
                      height: 10,
                      borderRadius: 1,
                      backgroundColor: (t) =>
                        t.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 1,
                        backgroundColor: '#F59E0B',
                      },
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AssociatesByTermsOfPaymentChart;
