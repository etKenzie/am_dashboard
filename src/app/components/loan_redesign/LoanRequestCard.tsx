'use client';

import { Box, Card, CardContent, Typography } from '@mui/material';

export interface LoanRequestCardData {
  penetrationPercent: number;
  totalRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
}

interface LoanRequestCardProps {
  data?: LoanRequestCardData;
}

const EMPTY: LoanRequestCardData = {
  penetrationPercent: 0,
  totalRequests: 0,
  approvedRequests: 0,
  rejectedRequests: 0,
};

const APPROVED_COLOR = '#16A34A';
const REJECTED_COLOR = '#DC2626';

const mutedLabelSx = {
  color: (theme: { palette: { mode: string } }) =>
    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)',
};

function formatNumber(value: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatPercent(value: number): string {
  return `${value.toLocaleString('en-US', { maximumFractionDigits: 1 })}%`;
}

const LoanRequestCard = ({ data = EMPTY }: LoanRequestCardProps) => {
  const decided = data.approvedRequests + data.rejectedRequests;
  const approvedShare = decided > 0 ? (data.approvedRequests / decided) * 100 : 0;
  const approvedPctOfTotal =
    data.totalRequests > 0 ? (data.approvedRequests / data.totalRequests) * 100 : 0;
  const rejectedPctOfTotal =
    data.totalRequests > 0 ? (data.rejectedRequests / data.totalRequests) * 100 : 0;

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
            Loan Request
          </Typography>
          <Box
            sx={{
              px: 1.1,
              py: 0.35,
              borderRadius: 0.75,
              bgcolor: 'rgba(22, 163, 74, 0.12)',
              color: '#16A34A',
              border: '1px solid',
              borderColor: 'rgba(22, 163, 74, 0.28)',
              flexShrink: 0,
            }}
          >
            <Typography
              variant="body2"
              component="span"
              sx={{ letterSpacing: 0.2, display: 'inline-flex', gap: 0.5 }}
            >
              <Box component="span" fontWeight={800}>
                {formatPercent(data.penetrationPercent)}
              </Box>
              <Box component="span" fontWeight={600}>
                penetration
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
            {formatNumber(data.totalRequests)}
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
            Total Requests
          </Typography>
        </Box>

        <Box sx={{ mb: 1.75 }}>
          <Box
            sx={{
              width: '100%',
              height: 7,
              borderRadius: 1,
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              backgroundImage:
                decided > 0
                  ? `linear-gradient(to right, ${APPROVED_COLOR} 0%, ${APPROVED_COLOR} ${approvedShare}%, ${REJECTED_COLOR} ${approvedShare}%, ${REJECTED_COLOR} 100%)`
                  : 'none',
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: APPROVED_COLOR,
                  flexShrink: 0,
                }}
              />
              <Typography variant="body1" color="text.secondary" fontWeight={500}>
                Approved Requests
              </Typography>
            </Box>
            <Typography
              variant="body1"
              fontWeight={700}
              sx={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
            >
              {formatNumber(data.approvedRequests)} ({formatPercent(approvedPctOfTotal)})
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: REJECTED_COLOR,
                  flexShrink: 0,
                }}
              />
              <Typography variant="body1" color="text.secondary" fontWeight={500}>
                Rejected Requests
              </Typography>
            </Box>
            <Typography
              variant="body1"
              fontWeight={700}
              sx={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
            >
              {formatNumber(data.rejectedRequests)} ({formatPercent(rejectedPctOfTotal)})
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LoanRequestCard;
