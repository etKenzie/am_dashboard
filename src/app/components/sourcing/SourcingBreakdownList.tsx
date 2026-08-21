'use client';

import { Box, LinearProgress, Typography } from '@mui/material';
import type { SourcingNamedCount } from './sourcingDummyData';

interface SourcingBreakdownListProps {
  title: string;
  data: SourcingNamedCount[];
  colors?: string[];
}

const DEFAULT_COLORS = ['#0D9488', '#1E88E5', '#FB8C00', '#8E24AA', '#43A047', '#E53935'];

const SourcingBreakdownList = ({
  title,
  data,
  colors = DEFAULT_COLORS,
}: SourcingBreakdownListProps) => {
  const total = data.reduce((sum, row) => sum + row.value, 0);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.25 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {data.map((row, index) => {
          const pct = total > 0 ? (row.value / total) * 100 : 0;
          const color = colors[index % colors.length];
          return (
            <Box key={row.label}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 0.4 }}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {row.label}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                  {row.value.toLocaleString('en-US')} ({pct.toFixed(1)}%)
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={pct}
                sx={{
                  height: 8,
                  borderRadius: 999,
                  bgcolor: 'action.hover',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 999,
                    bgcolor: color,
                  },
                }}
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default SourcingBreakdownList;
