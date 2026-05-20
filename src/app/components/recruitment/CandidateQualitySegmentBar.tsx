'use client';

import { Box, Typography } from '@mui/material';

const POINTS_PER_SEGMENT = 5;
const TOTAL_SEGMENTS = 20;
const TICK_LABELS = [0, 25, 50, 75, 100];

const ZONE_RED_END = 10;
const ZONE_YELLOW_END = 15;

const COLOR_RED = '#EF4444';
const COLOR_YELLOW = '#F59E0B';
const COLOR_GREEN = '#22C55E';

const TICK_GREY = '#9CA3AF';

function segmentFillColor(index: number): string {
  if (index < ZONE_RED_END) return COLOR_RED;
  if (index < ZONE_YELLOW_END) return COLOR_YELLOW;
  return COLOR_GREEN;
}

interface CandidateQualitySegmentBarProps {
  /** 0–100 */
  score: number;
}

const CandidateQualitySegmentBar = ({ score }: CandidateQualitySegmentBarProps) => {
  const clamped = Math.min(100, Math.max(0, score));
  const filledSegments = Math.min(TOTAL_SEGMENTS, Math.floor(clamped / POINTS_PER_SEGMENT));

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          gap: 0.5,
          width: '100%',
          alignItems: 'stretch',
        }}
      >
        {Array.from({ length: TOTAL_SEGMENTS }, (_, index) => {
          const isFilled = index < filledSegments;
          return (
            <Box
              key={index}
              sx={(theme) => ({
                flex: 1,
                height: 40,
                borderRadius: 0.5,
                bgcolor: isFilled
                  ? segmentFillColor(index)
                  : theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.12)'
                    : '#E5E7EB',
              })}
            />
          );
        })}
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mt: 0.75,
          px: 0,
        }}
      >
        {TICK_LABELS.map((value) => (
          <Typography
            key={value}
            sx={{
              fontSize: '0.75rem',
              fontWeight: 500,
              color: TICK_GREY,
              lineHeight: 1,
            }}
          >
            {value}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

export default CandidateQualitySegmentBar;
