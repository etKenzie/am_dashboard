'use client';

import { Close as CloseIcon, Download as DownloadIcon, Search as SearchIcon } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import * as XLSX from 'xlsx';
import { useEffect, useState } from 'react';
import { TempInternalPayrollClientRankingRow } from '../../api/temp_internal_payroll/TempInternalPayrollSlice';

type SortField = keyof Pick<
  TempInternalPayrollClientRankingRow,
  'total_invoice' | 'outstanding_invoice' | 'overdue_invoice'
>;

interface ClientRankingTableProps {
  data: TempInternalPayrollClientRankingRow[];
  loading: boolean;
  error: string | null;
  title: string;
  sortBy: SortField;
  displayFieldLabel: string;
  formatValue: (value: number) => string;
  /** When set, shows search next to title; value sent as `search[value]` on the API. */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

const ClientRankingTable = ({
  data,
  loading,
  error,
  title,
  sortBy,
  displayFieldLabel,
  formatValue,
  searchValue = '',
  onSearchChange,
}: ClientRankingTableProps) => {
  const [searchExpanded, setSearchExpanded] = useState(false);
  const sortedData = [...data].sort((a, b) => (b[sortBy] as number) - (a[sortBy] as number));

  useEffect(() => {
    if (!searchExpanded) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchExpanded(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [searchExpanded]);

  const handleCloseSearch = () => {
    setSearchExpanded(false);
  };

  const prepareDataForExport = () => {
    return sortedData.map((item, index) => ({
      Rank: index + 1,
      'Sourced To': item.sourced_to,
      [displayFieldLabel]: formatValue(item[sortBy] as number),
    }));
  };

  const handleExcelExport = () => {
    if (!sortedData.length) return;
    if (typeof window === 'undefined' || typeof document === 'undefined' || typeof Blob === 'undefined') return;

    const exportData = prepareDataForExport();
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    ws['!cols'] = [{ wch: 8 }, { wch: 40 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws, title.replace(/\s+/g, '').slice(0, 31));
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexWrap: 'nowrap',
          px: 2,
          py: 1.5,
          minWidth: 0,
        }}
      >
        <Typography variant="h6" sx={{ flexShrink: 0 }}>
          {title}
        </Typography>
        {onSearchChange ? (
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                width: searchExpanded ? '100%' : 40,
                minWidth: searchExpanded ? 0 : 40,
                transition: (theme) =>
                  theme.transitions.create('width', {
                    easing: theme.transitions.easing.easeOut,
                    duration: theme.transitions.duration.shorter,
                  }),
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              {!searchExpanded ? (
                <Tooltip title="Search">
                  <IconButton
                    size="small"
                    color="primary"
                    aria-label="Open search"
                    onClick={() => setSearchExpanded(true)}
                    sx={{ flexShrink: 0 }}
                  >
                    <SearchIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <TextField
                  size="small"
                  placeholder="Search…"
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  autoFocus
                  fullWidth
                  sx={{ minWidth: 0 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          edge="end"
                          aria-label="Close search"
                          onClick={handleCloseSearch}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            </Box>
          </Box>
        ) : (
          <Box sx={{ flex: 1, minWidth: 0 }} />
        )}
        <Tooltip title="Download Excel">
          <span>
            <IconButton
              color="primary"
              onClick={handleExcelExport}
              disabled={sortedData.length === 0}
              size="small"
              aria-label="Download Excel"
              sx={{ flexShrink: 0 }}
            >
              <DownloadIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
      <Divider />
      <TableContainer sx={{ height: '350px' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', width: '80px', backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100') }}>Rank</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100') }}>Sourced To</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100') }} align="right">{displayFieldLabel}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography variant="body2" color="error">{error}</Typography>
                </TableCell>
              </TableRow>
            ) : sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography variant="body2" color="textSecondary">No data found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row, index) => (
                <TableRow key={`${row.sourced_to}-${index}`} hover>
                  <TableCell sx={{ fontWeight: 'bold' }}>{index + 1}</TableCell>
                  <TableCell>{row.sourced_to}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatValue(row[sortBy] as number)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ClientRankingTable;
