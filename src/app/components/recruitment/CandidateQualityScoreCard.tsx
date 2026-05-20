'use client';

import { Box, CircularProgress, Typography } from '@mui/material';
import CandidateQualitySegmentBar from './CandidateQualitySegmentBar';

interface CandidateQualityScoreCardProps {
  score: number | undefined;
  loading?: boolean;
}

const CandidateQualityScoreCard = ({ score, loading = false }: CandidateQualityScoreCardProps) => {
  const displayScore =
    score != null
      ? score.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
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
      <Typography variant="h6" sx={{ mb: 2.5, flexShrink: 0 }}>
        Candidate Quality Score
      </Typography>

      {loading ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography
            component="div"
            fontWeight={700}
            lineHeight={1.05}
            sx={{ fontSize: { xs: '3.25rem', sm: '3.75rem' }, mb: 3 }}
          >
            {displayScore}
            <Typography
              component="span"
              fontWeight={600}
              sx={{
                fontSize: { xs: '1.5rem', sm: '1.75rem' },
                ml: 0.5,
                color: '#9CA3AF',
              }}
            >
              /100
            </Typography>
          </Typography>
          {score != null && <CandidateQualitySegmentBar score={score} />}
        </Box>
      )}
    </Box>
  );
};

export default CandidateQualityScoreCard;
