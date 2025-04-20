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
      // Format dates with timezone for API request
      const formattedStartDate = format(startDate, "yyyy-MM-dd HH:mm:ss");
      const formattedEndDate = format(endDate, "yyyy-MM-dd HH:mm:ss");
      
      // Get timezone offset from timezone string
      let timezoneOffset = '';
      if (timezone === 'Asia/Calcutta') timezoneOffset = '+0530';
      else if (timezone === 'Asia/Dubai') timezoneOffset = '+0400';
      else if (timezone === 'Europe/Moscow') timezoneOffset = '+0300';
      else if (timezone === 'Europe/London') timezoneOffset = '+0000';
      else if (timezone === 'America/New_York') timezoneOffset = '-0500';
      else if (timezone === 'America/Los_Angeles') timezoneOffset = '-0800';
      
      // Add timezone offset to formatted dates
      const startDateWithTz = `${formattedStartDate} ${timezoneOffset}`;
      const endDateWithTz = `${formattedEndDate} ${timezoneOffset}`;
      
      const newData = await fetchDataForDateRange(startDateWithTz, endDateWithTz);
      
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
