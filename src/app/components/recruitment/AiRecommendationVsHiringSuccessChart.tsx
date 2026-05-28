'use client';

import { Box, CircularProgress, Typography } from '@mui/material';
import { AiVsHiringSuccessMetrics } from '../../api/recruitment/RecruitmentSlice';

interface AiRecommendationVsHiringSuccessChartProps {
  data: AiVsHiringSuccessMetrics | undefined;
  loading?: boolean;
}

const RING_SIZE = 168;
const RING_THICKNESS = 4.5;
const PURPLE_RING = '#7C3AED';
const TRACK_GREY = '#E5E7EB';

const AiRecommendationVsHiringSuccessChart = ({
  data,
  loading = false,
}: AiRecommendationVsHiringSuccessChartProps) => {
  const ai = data?.ai_recommendation ?? 0;
  const hiring = data?.hiring_success ?? 0;
  const successPct = ai > 0 ? Math.min(100, Math.max(0, (hiring / ai) * 100)) : 0;

  const hasData = data != null;

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
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        AI recommendation vs Hiring Success
      </Typography>

      {loading ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={24} />
        </Box>
      ) : !hasData ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography color="text.secondary">No data for the selected filters</Typography>
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
          <Box
            sx={{
              position: 'relative',
              display: 'inline-flex',
            }}
          >
            <CircularProgress
              variant="determinate"
              value={100}
              size={RING_SIZE}
              thickness={RING_THICKNESS}
              sx={{ color: TRACK_GREY }}
            />
            <CircularProgress
              variant="determinate"
              value={successPct}
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
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 0.45,
                  }}
                >
                  <Typography fontWeight={700} sx={{ fontSize: { xs: '1.35rem', sm: '1.55rem' } }}>
                    {hiring.toLocaleString('en-US')}
                  </Typography>
                  <Typography sx={{ fontSize: '0.82rem', color: '#9CA3AF', textTransform: 'lowercase', fontWeight: 700 }}>
                    hired
                  </Typography>
                </Box>
                <Box sx={{ width: 52, borderTop: '2px solid', borderColor: 'text.primary', my: 0.4 }} />
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 0.45,
                  }}
                >
                  <Typography fontWeight={700} sx={{ fontSize: { xs: '1.35rem', sm: '1.55rem' } }}>
                    {ai.toLocaleString('en-US')}
                  </Typography>
                  <Typography sx={{ fontSize: '0.82rem', color: '#9CA3AF', textTransform: 'lowercase', fontWeight: 700 }}>
                    rec
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AiRecommendationVsHiringSuccessChart;
