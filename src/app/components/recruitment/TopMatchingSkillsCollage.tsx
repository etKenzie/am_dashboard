'use client';

import { Box, CircularProgress, Typography } from '@mui/material';
import { MatchingSkill } from '../../api/recruitment/RecruitmentSlice';

const PURPLE_BORDER = '#7C3AED';
const PURPLE_TEXT_LIGHT = '#A78BFA';
const PURPLE_NUMBER_BG = 'rgba(124, 58, 237, 0.14)';

interface TopMatchingSkillsCollageProps {
  skills: MatchingSkill[];
  loading?: boolean;
}

const TopMatchingSkillsCollage = ({ skills, loading = false }: TopMatchingSkillsCollageProps) => {
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
        Top Matching Skills
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
        ) : skills.length === 0 ? (
          <Typography color="text.secondary">No matching skills for the selected filters</Typography>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.75,
              alignContent: 'flex-start',
              alignItems: 'flex-start',
            }}
          >
            {skills.map((skill) => (
              <Box
                key={skill.id}
                sx={{
                  display: 'inline-flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.25,
                  py: 0.5,
                  borderRadius: '20px',
                  border: `1px solid ${PURPLE_BORDER}`,
                  bgcolor: 'background.paper',
                  width: 'fit-content',
                  maxWidth: '100%',
                }}
              >
                <Typography
                  fontWeight={600}
                  sx={{
                    fontSize: '0.8125rem',
                    lineHeight: 1.25,
                    whiteSpace: 'nowrap',
                    color: PURPLE_TEXT_LIGHT,
                  }}
                >
                  {skill.name}
                </Typography>
                <Box
                  sx={{
                    flexShrink: 0,
                    px: 0.75,
                    py: 0.15,
                    borderRadius: '12px',
                    bgcolor: PURPLE_NUMBER_BG,
                  }}
                >
                  <Typography
                    fontWeight={800}
                    sx={{
                      color: PURPLE_TEXT_LIGHT,
                      fontSize: '0.875rem',
                      lineHeight: 1.2,
                    }}
                  >
                    {skill.candidate_count.toLocaleString('en-US')}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TopMatchingSkillsCollage;
