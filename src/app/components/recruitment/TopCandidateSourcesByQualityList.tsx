'use client';

import { Box, CircularProgress, LinearProgress, Typography } from '@mui/material';
import { CandidateSourceByQuality } from '../../api/recruitment/RecruitmentSlice';

const PURPLE_ICON = '#7C3AED';

interface TopCandidateSourcesByQualityListProps {
  sources: CandidateSourceByQuality[];
  loading?: boolean;
}

const TopCandidateSourcesByQualityList = ({ sources, loading = false }: TopCandidateSourcesByQualityListProps) => {
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
        Top Candidates Sources by Quality
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
        ) : sources.length === 0 ? (
          <Typography color="text.secondary">No source data for the selected filters</Typography>
        ) : (
          sources.map((source, index) => {
            const progress = Math.min(100, Math.max(0, source.quality_percent));
            return (
              <Box key={source.id}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 1,
                    mb: 0.75,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.35 }}>
                      {source.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontWeight={600}
                      sx={{ mt: 0.35, lineHeight: 1.3 }}
                    >
                      {source.hires.toLocaleString('en-US')} hires
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    sx={{ flexShrink: 0, color: PURPLE_ICON, pt: 0.15 }}
                  >
                    {progress.toLocaleString('en-US', { maximumFractionDigits: 1 })}%
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
                {index < sources.length - 1 && (
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

export default TopCandidateSourcesByQualityList;
