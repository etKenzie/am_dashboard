'use client';

import { Box, Card, CardContent, Typography } from '@mui/material';

export interface PrincipalRepaymentCardData {
  collectionRate: number;
  principalCollected: number;
  /** On-time portion of collected principal (total − OD1 − OD2) */
  principalCollectedOnTime: number;
  principalCollectedOd1: number;
  principalCollectedOd2: number;
  unrecoveredPrincipal: number;
}

interface PrincipalRepaymentCardProps {
  data?: PrincipalRepaymentCardData;
}

const EMPTY: PrincipalRepaymentCardData = {
  collectionRate: 0,
  principalCollected: 0,
  principalCollectedOnTime: 0,
  principalCollectedOd1: 0,
  principalCollectedOd2: 0,
  unrecoveredPrincipal: 0,
};

const ON_TIME_COLOR = '#16A34A';
const OD1_COLOR = '#D97706';
const OD2_COLOR = '#EA580C';
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

function CompositionRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: color,
            flexShrink: 0,
          }}
        />
        <Typography variant="body1" color="text.secondary" fontWeight={500} noWrap>
          {label}
        </Typography>
      </Box>
      <Typography
        variant="body1"
        fontWeight={700}
        sx={{ fontVariantNumeric: 'tabular-nums', textAlign: 'right', color }}
      >
        {formatIdr(value)}
      </Typography>
    </Box>
  );
}

const PrincipalRepaymentCard = ({ data = EMPTY }: PrincipalRepaymentCardProps) => {
  const total =
    data.principalCollectedOnTime +
    data.principalCollectedOd1 +
    data.principalCollectedOd2 +
    data.unrecoveredPrincipal;

  const share = (value: number) => (total > 0 ? Math.max(0, (value / total) * 100) : 0);

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
            Principal Repayment
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
              color: ON_TIME_COLOR,
              wordBreak: 'break-word',
            }}
          >
            {formatIdr(data.principalCollected)}
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
            Principal Collected
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            height: 6,
            borderRadius: 1,
            overflow: 'hidden',
            mb: 1.15,
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          }}
        >
          <Box sx={{ width: `${share(data.principalCollectedOnTime)}%`, bgcolor: ON_TIME_COLOR }} />
          <Box sx={{ width: `${share(data.principalCollectedOd1)}%`, bgcolor: OD1_COLOR }} />
          <Box sx={{ width: `${share(data.principalCollectedOd2)}%`, bgcolor: OD2_COLOR }} />
          <Box sx={{ width: `${share(data.unrecoveredPrincipal)}%`, bgcolor: UNRECOVERED_COLOR }} />
        </Box>

        <Box
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            pt: 0.9,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.65,
          }}
        >
          <CompositionRow
            label="On Time"
            value={data.principalCollectedOnTime}
            color={ON_TIME_COLOR}
          />
          <CompositionRow
            label="Overdue 1 Month"
            value={data.principalCollectedOd1}
            color={OD1_COLOR}
          />
          <CompositionRow
            label="Overdue 2 Month"
            value={data.principalCollectedOd2}
            color={OD2_COLOR}
          />
          <CompositionRow
            label="Unrecovered Principal"
            value={data.unrecoveredPrincipal}
            color={UNRECOVERED_COLOR}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default PrincipalRepaymentCard;
