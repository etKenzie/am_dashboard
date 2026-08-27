'use client';

import { Box, Card, CardContent, Typography } from '@mui/material';

export interface LoanDisbursementCardData {
  newBorrowers: number;
  totalDisbursed: number;
  averageDisbursed: number;
  processingTimeDays: number;
}

interface LoanDisbursementCardProps {
  data?: LoanDisbursementCardData;
}

const EMPTY: LoanDisbursementCardData = {
  newBorrowers: 0,
  totalDisbursed: 0,
  averageDisbursed: 0,
  processingTimeDays: 0,
};

const mutedLabelSx = {
  color: (theme: { palette: { mode: string } }) =>
    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)',
};

function formatNumber(value: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatIdr(value: number): string {
  return `IDR ${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

const LoanDisbursementCard = ({ data = EMPTY }: LoanDisbursementCardProps) => {
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
      <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            mb: 1.75,
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
            Disbursement
          </Typography>
          <Box
            sx={{
              px: 1.1,
              py: 0.35,
              borderRadius: 0.75,
              bgcolor: 'rgba(217, 119, 6, 0.12)',
              color: '#D97706',
              border: '1px solid',
              borderColor: 'rgba(217, 119, 6, 0.28)',
              flexShrink: 0,
            }}
          >
            <Typography
              variant="body2"
              component="span"
              sx={{ letterSpacing: 0.2, display: 'inline-flex', gap: 0.5 }}
            >
              <Box component="span" fontWeight={800}>
                {formatNumber(data.newBorrowers)}
              </Box>
              <Box component="span" fontWeight={600}>
                new borrowers
              </Box>
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 1.75 }}>
          <Typography
            variant="h2"
            fontWeight={700}
            sx={{
              lineHeight: 1.1,
              fontVariantNumeric: 'tabular-nums',
              fontSize: { xs: '1.55rem', sm: '1.85rem' },
              wordBreak: 'break-word',
            }}
          >
            {formatIdr(data.totalDisbursed)}
          </Typography>
          <Typography
            variant="body1"
            fontWeight={600}
            sx={{
              mt: 0.4,
              display: 'block',
              ...mutedLabelSx,
            }}
          >
            Total Disbursed
          </Typography>
        </Box>

        <Box
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            pt: 1.25,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.75,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Typography variant="body1" color="text.secondary" fontWeight={500}>
              Average Disbursed
            </Typography>
            <Typography
              variant="body1"
              fontWeight={700}
              sx={{ fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}
            >
              {formatIdr(data.averageDisbursed)}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Typography variant="body1" color="text.secondary" fontWeight={500}>
              Processing Time
            </Typography>
            <Typography variant="body1" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatNumber(data.processingTimeDays)} days
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LoanDisbursementCard;
