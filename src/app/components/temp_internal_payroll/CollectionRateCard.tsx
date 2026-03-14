'use client';

import { Box, CircularProgress, LinearProgress, Typography } from '@mui/material';
import React from 'react';
import DashboardCard from '../shared/DashboardCard';

/** Returns a color from red (0) to green (100) in HSL */
function getCollectionRateColor(percent: number): string {
  const hue = (percent / 100) * 120; // 0 = red, 120 = green
  return `hsl(${hue}, 55%, 42%)`;
}

interface CollectionRateCardProps {
  title?: string;
  /** Percentage 0-100 */
  value: number;
  isLoading?: boolean;
}

const CollectionRateCard: React.FC<CollectionRateCardProps> = ({
  title = 'Collection Rate',
  value,
  isLoading = false,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  const displayValue = typeof value === 'number' ? value.toFixed(1) : '0.0';
  const rateColor = getCollectionRateColor(clampedValue);

  return (
    <DashboardCard>
      <Box
        sx={{
          p: 2,
          height: '100%',
          minHeight: '96px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.875rem',
            color: 'text.secondary',
            fontWeight: 500,
            mb: 1,
          }}
        >
          {title}
        </Typography>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
          {isLoading ? (
            <CircularProgress size={24} />
          ) : (
            <Typography
              fontWeight="bold"
              sx={{ fontSize: '1.5rem', lineHeight: 1.2, color: rateColor }}
            >
              {displayValue}%
            </Typography>
          )}
        </Box>
        {/* Full-bleed at bottom: no horizontal or bottom margins */}
        <Box
          sx={{
            mt: 1,
            mx: 'calc(-30px - 16px)', // cancel CardContent (30px) + this Box padding (p: 2 = 16px)
            mb: '-30px', // sit flush with card bottom
          }}
        >
          <LinearProgress
            variant="determinate"
            value={clampedValue}
            sx={{
              height: 6,
              borderRadius: 0,
              backgroundColor: 'action.hover',
              '& .MuiLinearProgress-bar': {
                borderRadius: 0,
                backgroundColor: rateColor,
              },
            }}
          />
        </Box>
      </Box>
    </DashboardCard>
  );
};

export default CollectionRateCard;
