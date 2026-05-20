'use client';

import { Box, CircularProgress, LinearProgress, Typography } from '@mui/material';
import { TopHiringPosition } from '../../api/recruitment/RecruitmentSlice';

const PURPLE_ICON = '#7C3AED';

interface TopHiringPositionsListProps {
  positions: TopHiringPosition[];
  loading?: boolean;
}

const TopHiringPositionsList = ({ positions, loading = false }: TopHiringPositionsListProps) => {
  return (
    <Box
      sx={{
        flex: 1,
        height: '100%',
        maxHeight: { xs: 400, lg: 360 },
        minHeight: { xs: 280, lg: 360 },
        display: 'flex',
        flexDirection: 'column',
        p: 2.5,
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, flexShrink: 0 }}>
        Top Hiring Positions
      </Typography>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          pr: 0.5,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: 3,
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'),
          },
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : positions.length === 0 ? (
          <Typography color="text.secondary">No position data for the selected filters</Typography>
        ) : (
          positions.map((position, index) => {
            const progress = position.target > 0 ? Math.min(100, (position.hired / position.target) * 100) : 0;
            return (
              <Box key={position.id}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: 1,
                    mb: 0.75,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.35 }}>
                    {position.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={600}
                    sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                  >
                    {position.hired} hired / {position.target} target
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : '#E5E7EB'),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      bgcolor: PURPLE_ICON,
                    },
                  }}
                />
                {index < positions.length - 1 && (
                  <Box
                    component="hr"
                    sx={{
                      border: 0,
                      borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                      my: 1.75,
                      mx: 0,
                    }}
                  />
                )}
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
};

export default TopHiringPositionsList;
