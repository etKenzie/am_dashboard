'use client';

import { Box, Card, CardContent, Typography } from '@mui/material';

export interface PerformanceCardData {
  adminFeeProfit: number;
  delinquenciesRate: number;
}

interface PerformanceCardProps {
  data?: PerformanceCardData;
}

const EMPTY: PerformanceCardData = {
  adminFeeProfit: 0,
  delinquenciesRate: 0,
};

const POSITIVE_COLOR = '#16A34A';
const NEGATIVE_COLOR = '#DC2626';

const mutedLabelSx = {
  color: (theme: { palette: { mode: string } }) =>
    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)',
};

function formatPercent(value: number): string {
  return `${value.toLocaleString('en-US', { maximumFractionDigits: 1 })}%`;
}

function formatIdr(value: number): string {
  const abs = Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 0 });
  return value < 0 ? `-IDR ${abs}` : `IDR ${abs}`;
}

const PerformanceCard = ({ data = EMPTY }: PerformanceCardProps) => {
  const profitColor = data.adminFeeProfit < 0 ? NEGATIVE_COLOR : POSITIVE_COLOR;

  return (
    <Card
      sx={(theme) => ({
        height: '100%',
        border: '1px solid',
        borderColor:
          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)',
        boxShadow:
          theme.palette.mode === 'dark' ? 'none' : '0 1px 4px rgba(0, 0, 0, 0.06)',
      })}
    >
      <CardContent sx={{ p: 1.35, '&:last-child': { pb: 1.35 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            mb: 1.15,
            minHeight: 28,
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              lineHeight: 1.2,
              ...mutedLabelSx,
            }}
          >
            Performance
          </Typography>
        </Box>

        <Box sx={{ mb: 1.15 }}>
          <Typography
            variant="h2"
            fontWeight={700}
            sx={{
              lineHeight: 1.1,
              fontVariantNumeric: 'tabular-nums',
              fontSize: { xs: '1.35rem', sm: '1.6rem' },
              color: profitColor,
              wordBreak: 'break-word',
            }}
          >
            {formatIdr(data.adminFeeProfit)}
          </Typography>
          <Typography
            variant="body1"
            fontWeight={600}
            sx={{
              mt: 0.25,
              display: 'block',
              ...mutedLabelSx,
            }}
          >
            Admin Fee Profit
          </Typography>
        </Box>

        <Box
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            pt: 0.9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            Delinquencies Rate
          </Typography>
          <Typography
            variant="body1"
            fontWeight={700}
            sx={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {formatPercent(data.delinquenciesRate)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PerformanceCard;
