'use client';

import { Download as DownloadIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import * as XLSX from 'xlsx';
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
}

const ClientRankingTable = ({
  data,
  loading,
  error,
  title,
  sortBy,
  displayFieldLabel,
  formatValue,
}: ClientRankingTableProps) => {
  const sortedData = [...data].sort((a, b) => (b[sortBy] as number) - (a[sortBy] as number));

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
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          py: 1.5,
        }}
      >
        <Typography variant="h6">{title}</Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExcelExport}
          disabled={sortedData.length === 0}
          size="small"
        >
          Export Excel
        </Button>
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
