'use client';

import {
    Box,
    Card,
    CardContent,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Typography
} from '@mui/material';
import dynamic from "next/dynamic";
import React, { useEffect, useMemo, useState } from 'react';
import { CoverageUtilizationMonthlyResponse, fetchCoverageUtilizationMonthly } from '../../api/loan/LoanSlice';
import { getLoanChartDateBounds, type LoanTrendChartFilters } from './kasbonDateHelpers';
import { formatClientSegmentParam } from './KasbonFilters';

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface CoverageUtilizationChartProps {
  filters: LoanTrendChartFilters;
  onLoadingChange?: (loading: boolean) => void;
}

type ChartType = 'requests' | 'amounts' | 'rates';

const CoverageUtilizationChart = ({ filters, onLoadingChange }: CoverageUtilizationChartProps) => {
  const [chartData, setChartData] = useState<CoverageUtilizationMonthlyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState<ChartType>('requests');
  const [chartYear, setChartYear] = useState(filters.year ?? '');

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());
  }, []);

  useEffect(() => {
    if (filters.dateMode === 'month' && filters.year) {
      setChartYear(filters.year);
    }
  }, [filters.dateMode, filters.year]);

  const dateBounds = useMemo(
    () => getLoanChartDateBounds(filters, chartYear),
    [filters, chartYear],
  );

  const fetchChartData = async () => {
    if (!dateBounds) return;
    
    setLoading(true);
    try {
      const response = await fetchCoverageUtilizationMonthly({
        employer: filters.employer || undefined,
        sourced_to: filters.placement || undefined,
        project: filters.project || undefined,
        client_segment: formatClientSegmentParam(filters.clientSegments),
        product_type: filters.productType || undefined,
        start_date: dateBounds.startDate,
        end_date: dateBounds.endDate,
        loan_type: filters.loanType,
      });
      setChartData(response);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [
    dateBounds?.startDate,
    dateBounds?.endDate,
    filters.employer,
    filters.placement,
    filters.project,
    filters.clientSegments,
    filters.productType,
    filters.loanType,
  ]);

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  const handleChartTypeChange = (event: SelectChangeEvent<ChartType>) => {
    setChartType(event.target.value as ChartType);
  };

  const formatValue = (value: number) => {
    if (chartType === 'amounts') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    } else if (chartType === 'rates') {
      return `${(value * 100).toFixed(2)}%`;
    }
    return value.toLocaleString('id-ID');
  };

  const prepareChartData = () => {
    if (!chartData?.monthly_data) return { categories: [], series: [] };

    const months = Object.keys(chartData.monthly_data).sort((a, b) => {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      
      const [monthA, yearA] = a.split(' ');
      const [monthB, yearB] = b.split(' ');
      
      const yearDiff = parseInt(yearA) - parseInt(yearB);
      if (yearDiff !== 0) return yearDiff;
      
      const monthIndexA = monthNames.indexOf(monthA);
      const monthIndexB = monthNames.indexOf(monthB);
      
      return monthIndexA - monthIndexB;
    });
    
    const categories = months;
    
    let series: any[] = [];

    if (chartType === 'requests') {
      series = [
        {
          name: 'Total Loan Requests',
          data: months.map(month => chartData.monthly_data[month].total_loan_requests)
        },
        {
          name: 'Total Approved Requests',
          data: months.map(month => chartData.monthly_data[month].total_approved_requests)
        },
        {
          name: 'Total Rejected Requests',
          data: months.map(month => chartData.monthly_data[month].total_rejected_requests)
        },
        {
          name: 'Total New Borrowers',
          data: months.map(month => chartData.monthly_data[month].total_first_borrow)
        }
      ];
    } else if (chartType === 'amounts') {
      series = [
        {
          name: 'Total Disbursed Amount',
          data: months.map(month => chartData.monthly_data[month].total_disbursed_amount)
        }
      ];
    } else if (chartType === 'rates') {
      series = [
        {
          name: 'Penetration Rate',
          data: months.map(month => chartData.monthly_data[month].penetration_rate)
        }
      ];
    }

    return {
      categories,
      series
    };
  };

  const chartDataConfig = prepareChartData();

  const chartOptions = {
    chart: {
      type: 'line' as const,
      height: 350,
      toolbar: {
        show: false
      }
    },
    stroke: {
      curve: 'smooth' as const,
      width: 3
    },
    xaxis: {
      categories: chartDataConfig.categories,
      labels: {
        style: {
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: function(value: number) {
          return formatValue(value);
        }
      }
    },
    tooltip: {
      y: {
        formatter: function(value: number) {
          return formatValue(value);
        }
      }
    },
    colors: ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#06B6D4'],
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 4
    },
    markers: {
      size: 6,
      strokeColors: '#FFFFFF',
      strokeWidth: 2
    },
    legend: {
      position: 'bottom' as const,
      horizontalAlign: 'center' as const
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ margin: 0 }}>
            Coverage Utilization Monthly Trend
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl size="small">
              <InputLabel>Chart Type</InputLabel>
              <Select
                value={chartType}
                label="Chart Type"
                onChange={handleChartTypeChange}
              >
                <MenuItem value="requests">Loan Requests</MenuItem>
                <MenuItem value="amounts">Disbursed Amounts</MenuItem>
                <MenuItem value="rates">Penetration Rate</MenuItem>
              </Select>
            </FormControl>

            {filters.dateMode === 'month' && (
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Year</InputLabel>
                <Select
                  value={chartYear}
                  label="Year"
                  onChange={(event) => setChartYear(event.target.value)}
                >
                  {yearOptions.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </Box>

        <Box sx={{ height: 400, position: 'relative' }}>
          {loading ? (
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%' 
              }}
            >
              <CircularProgress size={24} />
            </Box>
          ) : chartData?.monthly_data && Object.keys(chartData.monthly_data).length > 0 ? (
            <ReactApexChart
              options={chartOptions}
              series={chartDataConfig.series}
              type="line"
              height={350}
            />
          ) : (
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%' 
              }}
            >
              <Typography color="textSecondary">No data available for the selected period</Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default React.memo(CoverageUtilizationChart);
