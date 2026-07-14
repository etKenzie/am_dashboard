'use client';

import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Button,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import type { AopHeadcountCategory } from './aopChartHelpers';

interface AopOtherCategoriesPanelProps {
  items: AopHeadcountCategory[];
  otherTotal: number;
  /** Grand total across all categories (chart + other), used for %. */
  total: number;
  categoryHeader: string;
  entityNoun?: string;
}

const AopOtherCategoriesPanel = ({
  items,
  otherTotal,
  total,
  categoryHeader,
  entityNoun = 'associates',
}: AopOtherCategoriesPanelProps) => {
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <Box sx={{ mt: 1.5 }}>
      <Button
        size="small"
        onClick={() => setOpen((prev) => !prev)}
        endIcon={open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        sx={{ textTransform: 'none', px: 0.5 }}
      >
        Show {items.length} smaller {categoryHeader.toLowerCase()}
        {' '}({otherTotal.toLocaleString('en-US')} {entityNoun})
      </Button>

      <Collapse in={open}>
        <TableContainer sx={{ mt: 1, maxHeight: 280 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>{categoryHeader}</TableCell>
                <TableCell align="right">Headcount</TableCell>
                <TableCell align="right">% of total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((row) => (
                <TableRow key={row.label} hover>
                  <TableCell>{row.label}</TableCell>
                  <TableCell align="right">{row.value.toLocaleString('en-US')}</TableCell>
                  <TableCell align="right">
                    {total > 0 ? `${((row.value / total) * 100).toFixed(1)}%` : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          These categories are aggregated into the &quot;Other&quot; bar on the chart above.
        </Typography>
      </Collapse>
    </Box>
  );
};

export default AopOtherCategoriesPanel;
