'use client';

import { Box, Card, CardContent, LinearProgress, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';

export interface AgeRangeItem {
  range: string;
  count: number;
  color: string;
}

interface DemographyAgeRangeListProps {
  data?: AgeRangeItem[];
}

const AGE_COLORS = ['#2563EB', '#16A34A', '#D97706', '#7C3AED', '#DC2626', '#64748B'];

export function mapAgeRangeItems(
  items: Array<{ age_range: string; total_count: number }> | undefined,
): AgeRangeItem[] {
  if (!items?.length) return [];
  return items.map((item, index) => ({
    range: item.age_range || 'Unknown',
    count: item.total_count ?? 0,
    color: AGE_COLORS[index % AGE_COLORS.length],
  }));
}

const titleSx = {
  fontWeight: 700,
  fontSize: '1.15rem',
  color: 'text.primary',
  mb: 0.5,
};

const DemographyAgeRangeList = ({ data = [] }: DemographyAgeRangeListProps) => {
  const { rows, total } = useMemo(() => {
    const totalValue = data.reduce((sum, row) => sum + row.count, 0);
    return {
      total: totalValue,
      rows: data.map((row) => ({
        ...row,
        pct: totalValue > 0 ? (row.count / totalValue) * 100 : 0,
      })),
    };
  }, [data]);

  return (
    <Card
      sx={(t) => ({
        height: '100%',
        border: '1px solid',
        borderColor: t.palette.mode === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)',
        boxShadow: t.palette.mode === 'dark' ? 'none' : '0 1px 4px rgba(0, 0, 0, 0.06)',
      })}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography sx={titleSx}>Demography Loaner Age Range</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Total: {total.toLocaleString('en-US')} borrowers
        </Typography>

        <Stack spacing={2}>
          {rows.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No age range data
            </Typography>
          ) : (
            rows.map((row) => (
              <Box key={row.range}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: 2,
                    mb: 0.75,
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 600, minWidth: 64 }}>
                    {row.range}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
                    >
                      {row.count.toLocaleString('en-US')}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ width: 56, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
                    >
                      {row.pct.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={row.pct}
                  sx={{
                    height: 10,
                    borderRadius: 1,
                    backgroundColor: (t) =>
                      t.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 1,
                      backgroundColor: row.color,
                    },
                  }}
                />
              </Box>
            ))
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default DemographyAgeRangeList;
