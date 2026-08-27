'use client';

import { Download as DownloadIcon, Refresh as RefreshIcon, Search as SearchIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  fetchKaryawanOverdue,
  KaryawanOverdue,
  OverdueStatus,
} from '../../api/loan/LoanSlice';
import {
  formatKasbonDateLabel,
  isKasbonDateFilterReady,
  kasbonDateParams,
  type LoanDateMode,
} from './kasbonDateHelpers';
import { formatClientSegmentParam } from './KasbonFilters';

type Order = 'asc' | 'desc';
type SortableField = keyof KaryawanOverdue | 'overdue_status';

interface HeadCell {
  id: SortableField;
  label: string;
  numeric: boolean;
}

const OVERDUE_STATUS_OPTIONS: OverdueStatus[] = ['OD-1', 'OD-2', 'Write-off'];

const headCells: HeadCell[] = [
  { id: 'id_karyawan', label: 'Employee ID', numeric: true },
  { id: 'name', label: 'Name', numeric: false },
  { id: 'company', label: 'Company', numeric: false },
  { id: 'sourced_to', label: 'Sourced To', numeric: false },
  { id: 'project', label: 'Project', numeric: false },
  { id: 'total_amount_owed', label: 'Amount Owed', numeric: true },
  { id: 'admin_fee', label: 'Admin Fee', numeric: true },
  { id: 'total_payment', label: 'Total Payment', numeric: true },
  { id: 'repayment_date', label: 'Repayment Date', numeric: false },
  { id: 'days_overdue', label: 'Days Overdue', numeric: true },
  { id: 'overdue_status', label: 'Overdue Status', numeric: false },
];

const NUMERIC_SORT_FIELDS: SortableField[] = [
  'id_karyawan',
  'total_amount_owed',
  'admin_fee',
  'total_payment',
  'days_overdue',
];

interface KaryawanOverdueTableProps {
  filters: {
    employer: string;
    placement: string;
    project: string;
    branch?: string;
    clientSegments?: string[];
    productType?: string;
    dateMode: LoanDateMode;
    month: string;
    year: string;
    startDate: string;
    endDate: string;
    loanType: string;
  };
  title?: string;
  onLoadingChange?: (loading: boolean) => void;
}

function normalizeOverdueStatus(value: string | undefined | null): OverdueStatus | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase().replace(/[_\s]+/g, '-');
  if (normalized === 'od-1' || normalized === 'od1') return 'OD-1';
  if (normalized === 'od-2' || normalized === 'od2') return 'OD-2';
  if (
    normalized === 'write-off' ||
    normalized === 'writeoff' ||
    normalized === 'write-offs'
  ) {
    return 'Write-off';
  }
  return null;
}

/** Prefer API overdue_status; otherwise derive from days overdue (1 mo / 2 mo / write-off). */
function getOverdueStatus(row: KaryawanOverdue): OverdueStatus {
  const fromApi = normalizeOverdueStatus(row.overdue_status);
  if (fromApi) return fromApi;

  const days = Number(row.days_overdue) || 0;
  if (days <= 30) return 'OD-1';
  if (days <= 60) return 'OD-2';
  return 'Write-off';
}

function overdueStatusRank(status: OverdueStatus): number {
  if (status === 'OD-1') return 1;
  if (status === 'OD-2') return 2;
  return 3;
}

function getOverdueStatusChipColor(status: OverdueStatus): 'warning' | 'error' | 'default' {
  if (status === 'OD-1') return 'warning';
  if (status === 'OD-2') return 'error';
  return 'default';
}

const KaryawanOverdueTable = ({
  filters,
  title = 'Overdue Karyawan',
  onLoadingChange,
}: KaryawanOverdueTableProps) => {
  const [karyawan, setKaryawan] = useState<KaryawanOverdue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderBy, setOrderBy] = useState<SortableField>('days_overdue');
  const [order, setOrder] = useState<Order>('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [overdueStatusFilter, setOverdueStatusFilter] = useState<'' | OverdueStatus>('');

  const fetchOverdueData = async () => {
    if (!isKasbonDateFilterReady(filters)) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetchKaryawanOverdue({
        employer: filters.employer || undefined,
        sourced_to: filters.placement || undefined,
        project: filters.project || undefined,
        branch: filters.branch || undefined,
        client_segment: formatClientSegmentParam(filters.clientSegments),
        product_type: filters.productType || undefined,
        id_karyawan: undefined,
        ...kasbonDateParams(filters),
        loan_type: filters.loanType,
      });

      setKaryawan(response.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Failed to fetch overdue data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isKasbonDateFilterReady(filters)) {
      fetchOverdueData();
    }
  }, [
    filters.dateMode,
    filters.month,
    filters.year,
    filters.startDate,
    filters.endDate,
    filters.employer,
    filters.placement,
    filters.project,
    filters.branch,
    filters.clientSegments,
    filters.productType,
    filters.loanType,
  ]);

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

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

  const getDaysOverdueColor = (days: number) => {
    if (days <= 7) return 'success';
    if (days <= 30) return 'warning';
    return 'error';
  };

  const searchFields = (row: KaryawanOverdue, query: string): boolean => {
    if (!query) return true;
    const status = getOverdueStatus(row);
    const searchableFields = [
      row.id_karyawan.toString(),
      row.name.toLowerCase(),
      row.company.toLowerCase(),
      row.sourced_to.toLowerCase(),
      row.project.toLowerCase(),
      row.repayment_date.toLowerCase(),
      row.days_overdue.toString(),
      row.admin_fee.toString(),
      row.total_payment.toString(),
      status.toLowerCase(),
    ];
    return searchableFields.some((field) => field.includes(query.toLowerCase()));
  };

  const filteredKaryawan = useMemo(() => {
    return karyawan.filter((k) => {
      if (overdueStatusFilter && getOverdueStatus(k) !== overdueStatusFilter) return false;
      if (searchQuery) return searchFields(k, searchQuery);
      return true;
    });
  }, [karyawan, overdueStatusFilter, searchQuery]);

  const sortedKaryawan = useMemo(() => {
    return [...filteredKaryawan].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (orderBy === 'overdue_status') {
        aValue = overdueStatusRank(getOverdueStatus(a));
        bValue = overdueStatusRank(getOverdueStatus(b));
      } else if (NUMERIC_SORT_FIELDS.includes(orderBy)) {
        aValue = Number(a[orderBy as keyof KaryawanOverdue] ?? 0);
        bValue = Number(b[orderBy as keyof KaryawanOverdue] ?? 0);
      } else {
        aValue = String(a[orderBy as keyof KaryawanOverdue] ?? '').toLowerCase();
        bValue = String(b[orderBy as keyof KaryawanOverdue] ?? '').toLowerCase();
      }

      if (order === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
      return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
    });
  }, [filteredKaryawan, orderBy, order]);

  const totalPayment = filteredKaryawan.reduce((sum, k) => sum + (k.total_payment || 0), 0);
  const totalOd1 = filteredKaryawan
    .filter((k) => getOverdueStatus(k) === 'OD-1')
    .reduce((sum, k) => sum + (k.total_payment || 0), 0);
  const totalOd2 = filteredKaryawan
    .filter((k) => getOverdueStatus(k) === 'OD-2')
    .reduce((sum, k) => sum + (k.total_payment || 0), 0);
  const totalWriteOff = filteredKaryawan
    .filter((k) => getOverdueStatus(k) === 'Write-off')
    .reduce((sum, k) => sum + (k.total_payment || 0), 0);

  const prepareDataForExport = (rows: KaryawanOverdue[]) =>
    rows.map((k) => ({
      'Employee ID': k.id_karyawan,
      Name: k.name,
      Company: k.company,
      'Sourced To': k.sourced_to,
      Project: k.project,
      'Amount Owed': k.total_amount_owed,
      'Admin Fee': k.admin_fee,
      'Total Payment': k.total_payment,
      'Repayment Date': k.repayment_date,
      'Days Overdue': k.days_overdue,
      'Overdue Status': getOverdueStatus(k),
    }));

  const handleExcelExport = () => {
    if (!filteredKaryawan.length) return;
    if (typeof window === 'undefined' || typeof document === 'undefined' || typeof Blob === 'undefined') {
      return;
    }

    const data = prepareDataForExport(sortedKaryawan);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 12 },
      { wch: 25 },
      { wch: 25 },
      { wch: 25 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 14 },
      { wch: 14 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Overdue Karyawan Data');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `karyawan-overdue-${formatKasbonDateLabel(filters).replace(/\s+/g, '_')}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchOverdueData}
              disabled={loading}
              sx={{ mr: 1 }}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExcelExport}
              disabled={filteredKaryawan.length === 0}
            >
              Export Excel
            </Button>
          </Box>
        </Box>

        <Box mb={3} sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
          <Box sx={{ textAlign: 'center', minWidth: '160px' }}>
            <Typography variant="h3" color="error" fontWeight="bold" mb={1}>
              {formatCurrency(totalPayment)}
            </Typography>
            <Typography variant="h6" color="textSecondary" fontWeight="500">
              Total Payment
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', minWidth: '160px' }}>
            <Typography variant="h3" color="primary" fontWeight="bold" mb={1}>
              {filteredKaryawan.length}
            </Typography>
            <Typography variant="h6" color="textSecondary" fontWeight="500">
              Total Overdue Employees
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', minWidth: '160px' }}>
            <Typography variant="h3" color="warning.main" fontWeight="bold" mb={1}>
              {formatCurrency(totalOd1)}
            </Typography>
            <Typography variant="h6" color="textSecondary" fontWeight="500">
              Total OD-1
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', minWidth: '160px' }}>
            <Typography variant="h3" color="error.main" fontWeight="bold" mb={1}>
              {formatCurrency(totalOd2)}
            </Typography>
            <Typography variant="h6" color="textSecondary" fontWeight="500">
              Total OD-2
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', minWidth: '160px' }}>
            <Typography variant="h3" color="text.primary" fontWeight="bold" mb={1}>
              {formatCurrency(totalWriteOff)}
            </Typography>
            <Typography variant="h6" color="textSecondary" fontWeight="500">
              Total Write-off
            </Typography>
          </Box>
        </Box>

        <Box mb={3}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search employees..."
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
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Overdue Status</InputLabel>
                <Select
                  value={overdueStatusFilter}
                  label="Overdue Status"
                  onChange={(e) => {
                    setOverdueStatusFilter(e.target.value as '' | OverdueStatus);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  {OVERDUE_STATUS_OPTIONS.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
              ) : sortedKaryawan.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={headCells.length} align="center">
                    <Typography variant="body2" color="textSecondary">
                      No overdue data found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sortedKaryawan
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => {
                    const status = getOverdueStatus(row);
                    return (
                      <TableRow key={row.id_karyawan} hover>
                        <TableCell align="right">{row.id_karyawan}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.company}</TableCell>
                        <TableCell>{row.sourced_to}</TableCell>
                        <TableCell>{row.project}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                          {formatCurrency(row.total_amount_owed)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                          {formatCurrency(row.admin_fee)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                          {formatCurrency(row.total_payment)}
                        </TableCell>
                        <TableCell>{formatDate(row.repayment_date)}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${row.days_overdue} days`}
                            color={getDaysOverdueColor(row.days_overdue) as 'success' | 'warning' | 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={status}
                            color={getOverdueStatusChipColor(status)}
                            size="small"
                            variant={status === 'Write-off' ? 'outlined' : 'filled'}
                          />
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
            count={filteredKaryawan.length}
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

export default KaryawanOverdueTable;
