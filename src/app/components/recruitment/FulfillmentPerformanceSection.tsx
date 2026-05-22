'use client';

import { Box, Typography } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { FulfillmentPerformance } from '../../api/recruitment/RecruitmentSlice';
import CandidateSourcesChart from './CandidateSourcesChart';
import FulfillmentMetricsQuad from './FulfillmentMetricsQuad';
import TopHiringPositionsList from './TopHiringPositionsList';
import { recruitmentCardOuterSx } from './recruitmentStyles';

interface FulfillmentPerformanceSectionProps {
  data: FulfillmentPerformance | undefined;
  loading?: boolean;
}

const panelSx = (theme: Theme) => ({
  flex: { xs: '1 1 auto', lg: '1 1 0' },
  minWidth: 0,
  minHeight: { xs: 260, lg: 400 },
  display: 'flex',
  flexDirection: 'column' as const,
  borderRadius: 2,
  overflow: 'hidden',
  bgcolor: 'background.paper',
  ...recruitmentCardOuterSx(theme),
});

const FulfillmentPerformanceSection = ({ data, loading = false }: FulfillmentPerformanceSectionProps) => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, mt: 0, fontWeight: 600 }}>
        Fulfillment Performance
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
          <FulfillmentMetricsQuad metrics={data?.metrics} loading={loading} />
        </Box>

        <Box sx={(theme) => panelSx(theme)}>
          <CandidateSourcesChart data={data?.candidate_sources ?? []} loading={loading} />
        </Box>

        <Box sx={(theme) => panelSx(theme)}>
          <TopHiringPositionsList positions={data?.top_hiring_positions ?? []} loading={loading} />
        </Box>
      </Box>
    </Box>
  );
};

export default FulfillmentPerformanceSection;
