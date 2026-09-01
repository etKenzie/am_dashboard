'use client';

import { Download as DownloadIcon, Refresh as RefreshIcon, Search as SearchIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import React, { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { ClientSummary } from '../../api/loan/LoanSlice';

type Order = 'asc' | 'desc';

type SortableField =
  | 'client_name'
  | 'eligible_active'
  | 'total_requests'
  | 'approved_requests'
  | 'penetration_rate'
  | 'total_disbursement'
  | 'od1_amount'
  | 'od2_amount'
  | 'delinquency_rate'
  | 'write_off_amount'
  | 'admin_fee_profit';

interface HeadCell {
  id: SortableField;
  label: string;
  numeric: boolean;
}

const headCells: HeadCell[] = [
  { id: 'client_name', label: 'Client Name', numeric: false },
  { id: 'eligible_active', label: 'Eligible / Active', numeric: true },
  { id: 'total_requests', label: 'Requested', numeric: true },
  { id: 'approved_requests', label: 'Approved', numeric: true },
  { id: 'penetration_rate', label: 'Penetration %', numeric: true },
  { id: 'total_disbursement', label: 'Disbursed', numeric: true },
  { id: 'od1_amount', label: 'Overdue 1 Month', numeric: true },
  { id: 'od2_amount', label: 'Overdue 2 Month', numeric: true },
  { id: 'delinquency_rate', label: 'Delinquency %', numeric: true },
  { id: 'write_off_amount', label: 'Write-off', numeric: true },
  { id: 'admin_fee_profit', label: 'Net Contribution', numeric: true },
];

interface ClientPerformanceTableProps {
  data: ClientSummary[];
  loading: boolean;
  error: string | null;
  title?: string;
  onRefresh?: () => void;
}

const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

const formatNumber = (value: number) => value.toLocaleString('en-US');

const clientName = (row: ClientSummary) => {
  if (row.sourced_to && row.project && row.sourced_to !== row.project) {
    return `${row.sourced_to} / ${row.project}`;
  }
  return row.sourced_to || row.project || '—';
};

const getSortValue = (row: ClientSummary, field: SortableField): string | number => {
  switch (field) {
    case 'client_name':
      return clientName(row).toLowerCase();
    case 'eligible_active':
      return row.eligible_employees;
    case 'od1_amount':
      return row.od1_amount ?? 0;
    case 'od2_amount':
      return row.od2_amount ?? 0;
    case 'write_off_amount':
      return row.write_off_amount ?? 0;
    default:
      return row[field] as number;
  }
};

const ClientPerformanceTable = ({
  data,
  loading,
  error,
  title = 'Client Performance',
  onRefresh,
}: ClientPerformanceTableProps) => {
  const [orderBy, setOrderBy] = useState<SortableField>('total_disbursement');
  const [order, setOrder] = useState<Order>('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRequestSort = (property: SortableField) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((row) => {
      const searchable = [
        clientName(row),
        row.sourced_to,
        row.project,
        String(row.eligible_employees),
        String(row.active_employees),
        String(row.total_requests),
        String(row.approved_requests),
        String(row.total_disbursement),
        String(row.admin_fee_profit),
      ];
      return searchable.some((field) => field.toLowerCase().includes(query));
    });
  }, [data, searchQuery]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aValue = getSortValue(a, orderBy);
      const bValue = getSortValue(b, orderBy);
      if (order === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
      return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
    });
  }, [filteredData, orderBy, order]);

  const totalDisbursed = filteredData.reduce((sum, row) => sum + (row.total_disbursement || 0), 0);
  const totalNetContribution = filteredData.reduce((sum, row) => sum + (row.admin_fee_profit || 0), 0);
  const avgPenetration =
    filteredData.length > 0
      ? filteredData.reduce((sum, row) => sum + (row.penetration_rate || 0), 0) / filteredData.length
      : 0;

  const prepareDataForExport = (rows: ClientSummary[]) =>
    rows.map((item) => ({
      'Client Name': clientName(item),
      'Eligible/Active': `${formatNumber(item.eligible_employees)} / ${formatNumber(item.active_employees)}`,
      Requested: item.total_requests,
      Approved: item.approved_requests,
      'Penetration %': formatPercent(item.penetration_rate),
      Disbursed: item.total_disbursement,
      'Overdue 1 Month': item.od1_amount ?? 0,
      'Overdue 2 Month': item.od2_amount ?? 0,
      'Delinquency %': formatPercent(item.delinquency_rate),
      'Write-off': item.write_off_amount ?? 0,
      'Net Contribution': item.admin_fee_profit,
    }));

  const handleExcelExport = () => {
    if (!filteredData.length) return;
    if (typeof window === 'undefined' || typeof document === 'undefined' || typeof Blob === 'undefined') {
      return;
    }

    const exportData = prepareDataForExport(sortedData);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    ws['!cols'] = [
      { wch: 40 },
      { wch: 18 },
      { wch: 12 },
      { wch: 12 },
      { wch: 14 },
      { wch: 18 },
      { wch: 16 },
      { wch: 16 },
      { wch: 14 },
      { wch: 14 },
      { wch: 18 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'ClientPerformance');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'client-performance.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h6">{title}</Typography>
          <Box>
            {onRefresh && (
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={onRefresh}
                disabled={loading}
                sx={{ mr: 1 }}
              >
                Refresh
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExcelExport}
              disabled={filteredData.length === 0}
            >
              Export Excel
            </Button>
          </Box>
        </Box>

        <Box mb={3} sx={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Box sx={{ textAlign: 'center', minWidth: '180px' }}>
            <Typography variant="h3" color="primary" fontWeight="bold" mb={1}>
              {filteredData.length}
            </Typography>
            <Typography variant="h6" color="textSecondary" fontWeight="500">
              Total Clients
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', minWidth: '180px' }}>
            <Typography variant="h3" color="info.main" fontWeight="bold" mb={1}>
              {formatCurrency(totalDisbursed)}
            </Typography>
            <Typography variant="h6" color="textSecondary" fontWeight="500">
              Total Disbursed
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', minWidth: '180px' }}>
            <Typography variant="h3" color="success.main" fontWeight="bold" mb={1}>
              {formatCurrency(totalNetContribution)}
            </Typography>
            <Typography variant="h6" color="textSecondary" fontWeight="500">
              Net Contribution
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', minWidth: '180px' }}>
            <Typography variant="h3" color="warning.main" fontWeight="bold" mb={1}>
              {formatPercent(avgPenetration)}
            </Typography>
            <Typography variant="h6" color="textSecondary" fontWeight="500">
              Avg Penetration
            </Typography>
          </Box>
        </Box>

        <Box mb={3}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={headCell.numeric ? 'right' : 'left'}
                    sortDirection={orderBy === headCell.id ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : 'asc'}
                      onClick={() => handleRequestSort(headCell.id)}
                    >
                      {headCell.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={headCells.length} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={headCells.length} align="center">
                    <Typography variant="body2" color="error">
                      {error}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : sortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={headCells.length} align="center">
                    <Typography variant="body2" color="textSecondary">
                      No data found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sortedData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => {
                    const highDelinquency = row.delinquency_rate > 0.002;
                    return (
                      <TableRow key={`${row.sourced_to}-${row.project}`} hover>
                        <TableCell>{clientName(row)}</TableCell>
                        <TableCell align="right">
                          {formatNumber(row.eligible_employees)} / {formatNumber(row.active_employees)}
                        </TableCell>
                        <TableCell align="right">{formatNumber(row.total_requests)}</TableCell>
                        <TableCell align="right">{formatNumber(row.approved_requests)}</TableCell>
                        <TableCell align="right">{formatPercent(row.penetration_rate)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                          {formatCurrency(row.total_disbursement)}
                        </TableCell>
                        <TableCell align="right">{formatCurrency(row.od1_amount ?? 0)}</TableCell>
                        <TableCell align="right">{formatCurrency(row.od2_amount ?? 0)}</TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: highDelinquency ? 'bold' : 'normal',
                            color: highDelinquency ? 'error.main' : 'inherit',
                          }}
                        >
                          {formatPercent(row.delinquency_rate)}
                        </TableCell>
                        <TableCell align="right">{formatCurrency(row.write_off_amount ?? 0)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          {formatCurrency(row.admin_fee_profit)}
                        </TableCell>
                      </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default ClientPerformanceTable;
