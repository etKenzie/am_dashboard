'use client';

import { Box, Card, CardContent, LinearProgress, Typography } from '@mui/material';

export interface AdminFeeRepaymentCardData {
  collectionRate: number;
  adminFeeCollected: number;
  unrecoveredAdminFee: number;
}

interface AdminFeeRepaymentCardProps {
  data?: AdminFeeRepaymentCardData;
}

const EMPTY: AdminFeeRepaymentCardData = {
  collectionRate: 0,
  adminFeeCollected: 0,
  unrecoveredAdminFee: 0,
};

const COLLECTED_COLOR = '#16A34A';
const UNRECOVERED_COLOR = '#DC2626';
const STICKER_COLOR = '#16A34A';

const mutedLabelSx = {
  color: (theme: { palette: { mode: string } }) =>
    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)',
};

function formatPercent(value: number): string {
  return `${value.toLocaleString('en-US', { maximumFractionDigits: 1 })}%`;
}

function formatIdr(value: number): string {
  return `IDR ${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

const AdminFeeRepaymentCard = ({ data = EMPTY }: AdminFeeRepaymentCardProps) => {
  const total = data.adminFeeCollected + data.unrecoveredAdminFee;
  const progress = total > 0 ? Math.min(100, (data.adminFeeCollected / total) * 100) : 0;

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
            Admin Fee Repayment
          </Typography>
          <Box
            sx={{
              px: 1.1,
              py: 0.35,
              borderRadius: 0.75,
              bgcolor: 'rgba(22, 163, 74, 0.12)',
              color: STICKER_COLOR,
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
                {formatPercent(data.collectionRate)}
              </Box>
              <Box component="span" fontWeight={600}>
                collection rate
              </Box>
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 1.15 }}>
          <Typography
            variant="h2"
            fontWeight={700}
            sx={{
              lineHeight: 1.1,
              fontVariantNumeric: 'tabular-nums',
              fontSize: { xs: '1.35rem', sm: '1.6rem' },
              color: COLLECTED_COLOR,
              wordBreak: 'break-word',
            }}
          >
            {formatIdr(data.adminFeeCollected)}
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
            Admin Fee Collected
          </Typography>
        </Box>

        <Box sx={{ mb: 1.15 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6,
              borderRadius: 1,
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 1,
                backgroundColor: COLLECTED_COLOR,
              },
            }}
          />
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
            Unrecovered Admin Fee
          </Typography>
          <Typography
            variant="body1"
            fontWeight={700}
            sx={{
              fontVariantNumeric: 'tabular-nums',
              textAlign: 'right',
              color: UNRECOVERED_COLOR,
            }}
          >
            {formatIdr(data.unrecoveredAdminFee)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AdminFeeRepaymentCard;
