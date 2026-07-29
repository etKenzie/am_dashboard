'use client';

import { Box, Card, CardContent, Typography } from '@mui/material';

export interface BadDebtRecoveryCardData {
  totalRecovery: number;
  principal: number;
  adminFee: number;
  loanRequests: number;
}

interface BadDebtRecoveryCardProps {
  data?: BadDebtRecoveryCardData;
}

const EMPTY: BadDebtRecoveryCardData = {
  totalRecovery: 0,
  principal: 0,
  adminFee: 0,
  loanRequests: 0,
};

const ACCENT_SOFT = '#8B5CF6';
const ACCENT_BORDER = 'rgba(124, 58, 237, 0.35)';
const ACCENT_BG = 'rgba(124, 58, 237, 0.07)';
const PRINCIPAL_COLOR = '#16A34A';
const ADMIN_FEE_COLOR = '#A78BFA';

function formatIdr(value: number): string {
  return `IDR ${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function formatPercent(value: number): string {
  return `${value.toLocaleString('en-US', { maximumFractionDigits: 1 })}%`;
}

function formatNumber(value: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

const BadDebtRecoveryCard = ({ data = EMPTY }: BadDebtRecoveryCardProps) => {
  const total = data.principal + data.adminFee;
  const principalPct = total > 0 ? (data.principal / total) * 100 : 0;
  const adminFeePct = total > 0 ? (data.adminFee / total) * 100 : 0;

  return (
    <Card
      sx={{
        border: '1px solid',
        borderColor: ACCENT_BORDER,
        bgcolor: ACCENT_BG,
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
          Total Recovery
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
                color: ACCENT_SOFT,
                wordBreak: 'break-word',
              }}
            >
              {formatIdr(data.totalRecovery)}
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
                Principal
              </Typography>
              <Typography
                fontWeight={700}
                sx={{
                  mt: 0.25,
                  color: PRINCIPAL_COLOR,
                  fontVariantNumeric: 'tabular-nums',
                  fontSize: { xs: '0.95rem', sm: '1.05rem' },
                }}
              >
                {formatIdr(data.principal)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                Admin Fee
              </Typography>
              <Typography
                fontWeight={700}
                sx={{
                  mt: 0.25,
                  color: ADMIN_FEE_COLOR,
                  fontVariantNumeric: 'tabular-nums',
                  fontSize: { xs: '0.95rem', sm: '1.05rem' },
                }}
              >
                {formatIdr(data.adminFee)}
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
                    ${PRINCIPAL_COLOR} 0%,
                    ${PRINCIPAL_COLOR} ${principalPct}%,
                    ${ADMIN_FEE_COLOR} ${principalPct}%,
                    ${ADMIN_FEE_COLOR} 100%)`
                : 'none',
          }}
        />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
            mt: 1,
          }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1.25, sm: 2.5 } }}>
            <Typography variant="caption" fontWeight={600} sx={{ color: PRINCIPAL_COLOR }}>
              Principal {formatPercent(principalPct)}
            </Typography>
            <Typography variant="caption" fontWeight={600} sx={{ color: ADMIN_FEE_COLOR }}>
              Admin Fee {formatPercent(adminFeePct)}
            </Typography>
          </Box>
          <Typography variant="caption" fontWeight={600} color="text.secondary">
            Loan Requests{' '}
            <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>
              {formatNumber(data.loanRequests)}
            </Box>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BadDebtRecoveryCard;
