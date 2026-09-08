'use client';

import { Box, CircularProgress, Popover, Typography } from '@mui/material';
import type { Icon } from '@tabler/icons-react';
import { IconInfoCircle } from '@tabler/icons-react';
import { useId, useState } from 'react';
import DashboardCard from '../shared/DashboardCard';
import { aopCardOuterSx } from './aopStyles';

const TEAL_ICON = '#0D9488';
const TEAL_ICON_BG = 'rgba(45, 212, 191, 0.28)';

export interface AopMetricBreakdownItem {
  label: string;
  value: React.ReactNode;
}

interface AopMetricCardProps {
  title: string;
  value: React.ReactNode;
  icon: Icon;
  loading?: boolean;
  /** Smaller icon tile for dense KPI grids (e.g. Sourcing). */
  compact?: boolean;
  /** `horizontal` = icon + value side-by-side; `stacked` = title, icon, big value centered. */
  variant?: 'horizontal' | 'stacked';
  /** Icon accent color (hex). Used for icon + circular background/border. */
  iconColor?: string;
  /** Optional detail rows shown in a popup when the indicator is clicked. */
  breakdown?: AopMetricBreakdownItem[];
  breakdownTitle?: string;
}

function withAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return hex;
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const AopMetricCard = ({
  title,
  value,
  icon: Icon,
  loading = false,
  compact = false,
  variant = 'horizontal',
  iconColor = TEAL_ICON,
  breakdown,
  breakdownTitle = 'Breakdown',
}: AopMetricCardProps) => {
  const isStacked = variant === 'stacked';
  const iconBoxSize = isStacked ? (compact ? 48 : 72) : compact ? 44 : 68;
  const iconSize = isStacked ? (compact ? 24 : 36) : compact ? 22 : 34;
  const iconBg = withAlpha(iconColor, 0.14);
  const iconBorder = withAlpha(iconColor, 0.35);
  const popoverId = useId();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const hasBreakdown = Boolean(breakdown && breakdown.length > 0);
  const open = Boolean(anchorEl);

  return (
    <DashboardCard
      cardSx={(theme) => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...aopCardOuterSx(theme),
      })}
      contentSx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        p: compact || isStacked ? '16px !important' : '20px !important',
      }}
    >
      <Box sx={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {hasBreakdown && (
          <>
            <Box
              component="button"
              type="button"
              aria-label="View breakdown"
              aria-describedby={open ? popoverId : undefined}
              aria-expanded={open}
              onClick={(event) => setAnchorEl(event.currentTarget)}
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                zIndex: 2,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1,
                py: 0.35,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'rgba(13, 148, 136, 0.35)',
                bgcolor: TEAL_ICON_BG,
                color: TEAL_ICON,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.75rem',
                fontWeight: 700,
                lineHeight: 1.2,
                '&:hover': {
                  bgcolor: 'rgba(45, 212, 191, 0.4)',
                },
              }}
            >
              <IconInfoCircle size={14} stroke={2.25} />
              Details
            </Box>

            <Popover
              id={popoverId}
              open={open}
              anchorEl={anchorEl}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{
                paper: {
                  sx: (theme) => ({
                    mt: 0.75,
                    minWidth: 260,
                    p: 1.75,
                    border: '1px solid',
                    borderColor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.16)'
                        : 'rgba(0,0,0,0.12)',
                    boxShadow:
                      theme.palette.mode === 'dark'
                        ? 'none'
                        : '0 8px 24px rgba(0, 0, 0, 0.12)',
                  }),
                },
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.25 }}>
                {breakdownTitle}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9 }}>
                {breakdown!.map((item) => (
                  <Box
                    key={item.label}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      {item.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}
                    >
                      {loading ? '—' : item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Popover>
          </>
        )}

        {isStacked ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              flex: 1,
              minHeight: compact ? 120 : 160,
              gap: compact ? 1 : 1.25,
              px: hasBreakdown ? 1.5 : 0,
            }}
          >
            <Typography
              variant="subtitle1"
              color="text.secondary"
              fontWeight={700}
              sx={{
                fontSize: { xs: '0.95rem', sm: '1.05rem' },
                lineHeight: 1.3,
              }}
            >
              {title}
            </Typography>

            <Box
              sx={{
                width: iconBoxSize,
                height: iconBoxSize,
                borderRadius: '50%',
                bgcolor: iconBg,
                color: iconColor,
                border: '2px solid',
                borderColor: iconBorder,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={iconSize} stroke={1.75} />
            </Box>

            <Typography
              variant="h3"
              fontWeight={800}
              lineHeight={1.1}
              sx={{
                fontSize: { xs: '1.65rem', sm: '1.9rem' },
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {loading ? <CircularProgress size={24} /> : value}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: compact ? 1.5 : 2,
              flex: 1,
              minHeight: compact ? 72 : 100,
            }}
          >
            <Box
              sx={{
                width: iconBoxSize,
                height: iconBoxSize,
                borderRadius: compact ? 2 : 2.5,
                bgcolor: TEAL_ICON_BG,
                color: TEAL_ICON,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={iconSize} stroke={1.75} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1, pr: hasBreakdown ? 5 : 0 }}>
              <Typography
                variant="h4"
                fontWeight={700}
                lineHeight={1.2}
                sx={{ fontSize: compact ? { xs: '1.15rem', sm: '1.25rem' } : { xs: '1.35rem', sm: '1.5rem' } }}
              >
                {loading ? <CircularProgress size={compact ? 20 : 24} /> : value}
              </Typography>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                fontWeight={600}
                sx={{
                  mt: 0.5,
                  fontSize: compact ? { xs: '0.8rem', sm: '0.85rem' } : { xs: '0.875rem', sm: '0.9375rem' },
                  lineHeight: 1.35,
                }}
              >
                {title}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </DashboardCard>
  );
};

export default AopMetricCard;
