'use client';

import { Box, Typography } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { CandidateQualityInsights } from '../../api/recruitment/RecruitmentSlice';
import AiRecommendationVsHiringSuccessChart from './AiRecommendationVsHiringSuccessChart';
import AiRecommendedCandidateCard from './AiRecommendedCandidateCard';
import CandidateQualityScoreCard from './CandidateQualityScoreCard';
import { recruitmentCardOuterSx } from './recruitmentStyles';

interface CandidateQualityInsightsSectionProps {
  data: CandidateQualityInsights | undefined;
  loading?: boolean;
}

const panelSx = (theme: Theme) => ({
  flex: { xs: '1 1 auto', lg: '1 1 0' },
  minWidth: 0,
  minHeight: { xs: 220, lg: 280 },
  display: 'flex',
  flexDirection: 'column' as const,
  borderRadius: 2,
  overflow: 'hidden',
  bgcolor: 'background.paper',
  ...recruitmentCardOuterSx(theme),
});

const CandidateQualityInsightsSection = ({ data, loading = false }: CandidateQualityInsightsSectionProps) => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, mt: 0, fontWeight: 600 }}>
        Candidate Quality Overview
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: 'stretch',
          width: '100%',
          gap: { xs: 2.5, lg: 3 },
        }}
      >
        <Box sx={(theme) => panelSx(theme)}>
          <CandidateQualityScoreCard score={data?.quality_score} loading={loading} />
        </Box>

        <Box sx={(theme) => panelSx(theme)}>
          <AiRecommendedCandidateCard percent={data?.ai_recommended_percent} loading={loading} />
        </Box>

        <Box sx={(theme) => panelSx(theme)}>
          <AiRecommendationVsHiringSuccessChart
            data={data?.ai_vs_hiring_success}
            loading={loading}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default CandidateQualityInsightsSection;
