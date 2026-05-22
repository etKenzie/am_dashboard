'use client';

import { Box, Typography } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { CandidateQualityInsights } from '../../api/recruitment/RecruitmentSlice';
import { recruitmentCardOuterSx } from './recruitmentStyles';
import TopCandidateSourcesByQualityList from './TopCandidateSourcesByQualityList';
import TopMatchingSkillsCollage from './TopMatchingSkillsCollage';

interface CandidateQualityInsightsBreakdownSectionProps {
  data: CandidateQualityInsights | undefined;
  loading?: boolean;
}

const panelSx = (theme: Theme) => ({
  flex: { xs: '1 1 auto', lg: '1 1 0' },
  minWidth: 0,
  minHeight: { xs: 320, lg: 360 },
  maxHeight: { xs: 420, lg: 360 },
  display: 'flex',
  flexDirection: 'column' as const,
  borderRadius: 2,
  overflow: 'hidden',
  bgcolor: 'background.paper',
  ...recruitmentCardOuterSx(theme),
});

const CandidateQualityInsightsBreakdownSection = ({
  data,
  loading = false,
}: CandidateQualityInsightsBreakdownSectionProps) => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, mt: 0, fontWeight: 600 }}>
        Candidate Quality Insights
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
          <TopMatchingSkillsCollage skills={data?.top_matching_skills ?? []} loading={loading} />
        </Box>

        <Box sx={(theme) => panelSx(theme)}>
          <TopCandidateSourcesByQualityList
            sources={data?.top_sources_by_quality ?? []}
            loading={loading}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default CandidateQualityInsightsBreakdownSection;
