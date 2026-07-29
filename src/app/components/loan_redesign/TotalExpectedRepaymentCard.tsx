'use client';

import { Box, Card, CardContent, Typography } from '@mui/material';

export interface TotalExpectedRepaymentCardData {
  totalExpected: number;
  collected: number;
  unrecovered: number;
  outstanding: number;
}

interface TotalExpectedRepaymentCardProps {
  data?: TotalExpectedRepaymentCardData;
}

const EMPTY: TotalExpectedRepaymentCardData = {
  totalExpected: 0,
  collected: 0,
  unrecovered: 0,
  outstanding: 0,
};

const PURPLE_SOFT = '#8B5CF6';
const PURPLE_BORDER = 'rgba(124, 58, 237, 0.35)';
const PURPLE_BG = 'rgba(124, 58, 237, 0.07)';
const COLLECTED_COLOR = '#16A34A';
const UNRECOVERED_COLOR = '#DC2626';
const OUTSTANDING_COLOR = '#8B5CF6';

function formatIdr(value: number): string {
  return `IDR ${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function formatPercent(value: number): string {
  return `${value.toLocaleString('en-US', { maximumFractionDigits: 1 })}%`;
}

const TotalExpectedRepaymentCard = ({ data = EMPTY }: TotalExpectedRepaymentCardProps) => {
  const total = data.collected + data.unrecovered + data.outstanding;
  const collectedPct = total > 0 ? (data.collected / total) * 100 : 0;
  const unrecoveredPct = total > 0 ? (data.unrecovered / total) * 100 : 0;
  const outstandingPct = total > 0 ? (data.outstanding / total) * 100 : 0;

  return (
    <Card
      sx={{
        border: '1px solid',
        borderColor: PURPLE_BORDER,
        bgcolor: PURPLE_BG,
        boxShadow: 'none',
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '1.15rem',
            color: 'text.primary',
            mb: 0.75,
          }}
        >
          Total Expected Repayment
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', md: 'flex-end' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 2, md: 3 },
            mb: 1.75,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              fontWeight={700}
              sx={{
                lineHeight: 1.1,
                fontVariantNumeric: 'tabular-nums',
                fontSize: { xs: '1.65rem', sm: '2rem', md: '2.2rem' },
                color: PURPLE_SOFT,
                wordBreak: 'break-word',
              }}
            >
              {formatIdr(data.totalExpected)}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: { xs: 2, sm: 3 },
              flexShrink: 0,
            }}
          >
            <Box>
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                Collected
              </Typography>
              <Typography
                fontWeight={700}
                sx={{
                  mt: 0.25,
                  color: COLLECTED_COLOR,
                  fontVariantNumeric: 'tabular-nums',
                  fontSize: { xs: '0.95rem', sm: '1.05rem' },
                }}
              >
                {formatIdr(data.collected)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                Unrecovered
              </Typography>
              <Typography
                fontWeight={700}
                sx={{
                  mt: 0.25,
                  color: UNRECOVERED_COLOR,
                  fontVariantNumeric: 'tabular-nums',
                  fontSize: { xs: '0.95rem', sm: '1.05rem' },
                }}
              >
                {formatIdr(data.unrecovered)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                Outstanding
              </Typography>
              <Typography
                fontWeight={700}
                sx={{
                  mt: 0.25,
                  color: OUTSTANDING_COLOR,
                  fontVariantNumeric: 'tabular-nums',
                  fontSize: { xs: '0.95rem', sm: '1.05rem' },
                }}
              >
                {formatIdr(data.outstanding)}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            width: '100%',
            height: 10,
            borderRadius: 1.5,
            overflow: 'hidden',
            bgcolor: 'rgba(124, 58, 237, 0.1)',
            backgroundImage:
              total > 0
                ? `linear-gradient(to right,
                    ${COLLECTED_COLOR} 0%,
                    ${COLLECTED_COLOR} ${collectedPct}%,
                    ${UNRECOVERED_COLOR} ${collectedPct}%,
                    ${UNRECOVERED_COLOR} ${collectedPct + unrecoveredPct}%,
                    ${OUTSTANDING_COLOR} ${collectedPct + unrecoveredPct}%,
                    ${OUTSTANDING_COLOR} 100%)`
                : 'none',
          }}
        />

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: { xs: 1.25, sm: 2.5 },
            mt: 1,
          }}
        >
          <Typography variant="caption" fontWeight={600} sx={{ color: COLLECTED_COLOR }}>
            Collected {formatPercent(collectedPct)}
          </Typography>
          <Typography variant="caption" fontWeight={600} sx={{ color: UNRECOVERED_COLOR }}>
            Unrecovered {formatPercent(unrecoveredPct)}
          </Typography>
          <Typography variant="caption" fontWeight={600} sx={{ color: OUTSTANDING_COLOR }}>
            Outstanding {formatPercent(outstandingPct)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TotalExpectedRepaymentCard;
