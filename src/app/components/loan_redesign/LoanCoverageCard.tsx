'use client';

import { Box, Card, CardContent, LinearProgress, Typography } from '@mui/material';

export interface LoanCoverageCardData {
  eligiblePercent: number;
  eligibleEmployees: number;
  totalActiveEmployees: number;
  coverageProject: number;
}

interface LoanCoverageCardProps {
  data?: LoanCoverageCardData;
}

const EMPTY: LoanCoverageCardData = {
  eligiblePercent: 0,
  eligibleEmployees: 0,
  totalActiveEmployees: 0,
  coverageProject: 0,
};

function formatNumber(value: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatPercent(value: number): string {
  return `${value.toLocaleString('en-US', { maximumFractionDigits: 1 })}%`;
}

const LoanCoverageCard = ({ data = EMPTY }: LoanCoverageCardProps) => {
  const progress =
    data.totalActiveEmployees > 0
      ? Math.min(100, (data.eligibleEmployees / data.totalActiveEmployees) * 100)
      : 0;

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
              color: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)',
            }}
          >
            Loan Coverage
          </Typography>
          <Box
            sx={{
              px: 1.1,
              py: 0.35,
              borderRadius: 0.75,
              bgcolor: 'rgba(139, 92, 246, 0.12)',
              color: '#8B5CF6',
              border: '1px solid',
              borderColor: 'rgba(139, 92, 246, 0.28)',
              flexShrink: 0,
            }}
          >
            <Typography
              variant="body2"
              component="span"
              sx={{ letterSpacing: 0.2, display: 'inline-flex', gap: 0.5 }}
            >
              <Box component="span" fontWeight={800}>
                {formatPercent(data.eligiblePercent)}
              </Box>
              <Box component="span" fontWeight={600}>
                eligible
              </Box>
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 1.75 }}>
          <Typography
            variant="h2"
            fontWeight={700}
            sx={{
              lineHeight: 1.05,
              fontVariantNumeric: 'tabular-nums',
              fontSize: { xs: '2rem', sm: '2.35rem' },
            }}
          >
            {formatNumber(data.eligibleEmployees)}
          </Typography>
          <Typography
            variant="body1"
            fontWeight={600}
            sx={{
              mt: 0.4,
              display: 'block',
              color: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)',
            }}
          >
            Eligible employees
          </Typography>
        </Box>

        <Box sx={{ mb: 1.75 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 7,
              borderRadius: 1,
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 1,
                backgroundColor: '#8B5CF6',
              },
            }}
          />
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
              Total Active Employees
            </Typography>
            <Typography variant="body1" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatNumber(data.totalActiveEmployees)}
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
              Coverage Project
            </Typography>
            <Typography variant="body1" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatNumber(data.coverageProject)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LoanCoverageCard;
