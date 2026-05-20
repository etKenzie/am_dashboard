'use client';

import { Box, CircularProgress, Typography } from '@mui/material';

const PURPLE_RING = '#7C3AED';
const TRACK_GREY = '#E5E7EB';

interface AiRecommendedCandidateCardProps {
  /** 0–100 */
  percent: number | undefined;
  loading?: boolean;
}

const RING_SIZE = 168;
const RING_THICKNESS = 4.5;

const AiRecommendedCandidateCard = ({ percent, loading = false }: AiRecommendedCandidateCardProps) => {
  const value = percent != null ? Math.min(100, Math.max(0, percent)) : 0;
  const displayPercent =
    percent != null
      ? `${value.toLocaleString('en-US', { maximumFractionDigits: 1 })}%`
      : '—';

  return (
    <Box
      sx={{
        flex: 1,
        height: '100%',
        minHeight: { xs: 200, lg: '100%' },
        display: 'flex',
        flexDirection: 'column',
        p: 2.5,
        minWidth: 0,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, flexShrink: 0 }}>
        AI Recommended Candidate
      </Typography>

      {loading ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              variant="determinate"
              value={100}
              size={RING_SIZE}
              thickness={RING_THICKNESS}
              sx={{ color: TRACK_GREY }}
            />
            <CircularProgress
              variant="determinate"
              value={value}
              size={RING_SIZE}
              thickness={RING_THICKNESS}
              sx={{
                color: PURPLE_RING,
                position: 'absolute',
                left: 0,
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                },
              }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                px: 2,
              }}
            >
              <Typography fontWeight={700} lineHeight={1.15} sx={{ fontSize: { xs: '1.75rem', sm: '2rem' } }}>
                {displayPercent}
              </Typography>
              <Typography
                fontWeight={600}
                sx={{ fontSize: '0.8125rem', mt: 0.25, lineHeight: 1.2, color: '#9CA3AF' }}
              >
                Recommended
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AiRecommendedCandidateCard;
