import React, { useState, useEffect, useCallback } from 'react';
import { Box, Alert, Typography, Card, CardContent } from '@mui/material';
import { format, subDays } from 'date-fns';
import { fetchDataForDateRange } from '../services';
import { DataItem } from '../types';
import { useDataCache } from '../hooks';
import CustomDateRangePicker from './CustomDateRangePicker';
import EnhancedDataTable from './EnhancedDataTable';

const DataDashboard: React.FC = () => {
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [timezone, setTimezone] = useState<string>('Asia/Calcutta');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DataItem[]>([]);
  
  // Use our custom cache hook
  const { setCachedData, getCachedData } = useDataCache<DataItem[]>();

  // Format dates for cache key
  const getCacheKey = useCallback((start: Date, end: Date, tz: string): string => {
    return `${format(start, 'yyyy-MM-dd')}_${format(end, 'yyyy-MM-dd')}_${tz}`;
  }, []);

  const fetchData = useCallback(async () => {
    setError(null);
    
    // Check if we have cached data for this date range and timezone
    const cacheKey = getCacheKey(startDate, endDate, timezone);
    const cachedResult = getCachedData(cacheKey);
    
    if (cachedResult) {
      // Use cached data
      setData(cachedResult);
      return;
    }
    
    // Fetch new data
    setLoading(true);
    try {
      // Format dates with timezone for API request in dd/mm/yyyy format
      const formatDate = (date: Date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };
      
      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatDate(endDate);
      
      const newData = await fetchDataForDateRange(formattedStartDate, formattedEndDate);
      
      // Cache the result
      setCachedData(cacheKey, newData);
      setData(newData);
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, timezone, getCacheKey, getCachedData, setCachedData]);

  // Fetch data when dates or timezone changes
  useEffect(() => {
    fetchData();
  }, [startDate, endDate, timezone, fetchData]);

  // Handle date range and timezone change
  const handleDateRangeChange = (start: Date, end: Date, tz: string) => {
    setStartDate(start);
    setEndDate(end);
    setTimezone(tz);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        Data Dashboard
      </Typography>
      
      <Card elevation={3} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        <CardContent sx={{ p: 3 }}>
          <CustomDateRangePicker
            onRangeSelection={handleDateRangeChange}
            maxSelectionRangeInDays={10}
            defaultTimezone={timezone}
            textfieldSize="small"
          />
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>
          {error}
        </Alert>
      )}

      <Card elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
              Data Results
            </Typography>
          </Box>
          <EnhancedDataTable 
            data={data} 
            loading={loading} 
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default DataDashboard;
