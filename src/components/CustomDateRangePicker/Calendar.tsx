import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Tooltip,
  useTheme,
  TextField
} from '@mui/material';
import { format, isAfter, isBefore, isSameDay, differenceInDays, isWithinInterval } from 'date-fns';
import { CalendarProps } from '../../types/types';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// Constants
const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Define date messages for specific dates
const DATE_MESSAGES: Record<string, { message: string; disabled: boolean }> = {
  '2025-04-25': { message: 'Holiday - No data available', disabled: false },
  '2025-04-30': { message: 'End of month - Limited data', disabled: false },
  '2025-05-01': { message: 'New month - Fresh data', disabled: false },
};

// Maximum past days allowed for selection
const MAX_PAST_DAYS = 90;

const Calendar: React.FC<CalendarProps> = ({
  year,
  month,
  onSelection,
  selectedRange,
  maxSelectionRangeInDays = 10,
  timezone
}) => {
  const theme = useTheme();
  const [currentMonth, setCurrentMonth] = useState<number>(month);
  const [currentYear, setCurrentYear] = useState<number>(year);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [selectionState, setSelectionState] = useState<{
    startDate: Date | null;
    endDate: Date | null;
    selecting: boolean;
  }>({
    startDate: selectedRange.startDate,
    endDate: selectedRange.endDate,
    selecting: false
  });
  
  // Update local state when props change
  useEffect(() => {
    setSelectionState({
      startDate: selectedRange.startDate,
      endDate: selectedRange.endDate,
      selecting: false
    });
  }, [selectedRange]);

  // Generate calendar grid data
  const generateCalendarGrid = () => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();
    
    const grid: (Date | null)[][] = [];
    let day = 1;
    
    for (let week = 0; week < 6; week++) {
      const weekRow: (Date | null)[] = [];
      
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        if (week === 0 && dayOfWeek < startingDayOfWeek) {
          // Empty cells before the first day of the month
          weekRow.push(null);
        } else if (day > daysInMonth) {
          // Empty cells after the last day of the month
          weekRow.push(null);
        } else {
          // Valid day of the month
          weekRow.push(new Date(currentYear, currentMonth, day));
          day++;
        }
      }
      
      grid.push(weekRow);
      
      // Stop if we've reached the end of the month
      if (day > daysInMonth) break;
    }
    
    return grid;
  };

  // Handle month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Check if a date should be disabled
  const isDateDisabled = (date: Date): boolean => {
    // Check if date is in the DATE_MESSAGES and disabled
    const dateString = format(date, 'yyyy-MM-dd');
    if (DATE_MESSAGES[dateString]?.disabled) {
      return true;
    }
    
    // Check if date is more than MAX_PAST_DAYS days in the past
    const minAllowedDate = new Date();
    minAllowedDate.setDate(minAllowedDate.getDate() - MAX_PAST_DAYS);
    return isBefore(date, minAllowedDate);
  };

  // Handle date selection
  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;
    
    if (!selectionState.startDate || (selectionState.startDate && selectionState.endDate)) {
      // Start new selection
      setSelectionState({
        startDate: date,
        endDate: null,
        selecting: true
      });
    } else if (selectionState.startDate && !selectionState.endDate) {
      // Complete selection
      let startDate = selectionState.startDate;
      let endDate = date;
      
      // Ensure start date is before end date
      if (isAfter(startDate, endDate)) {
        [startDate, endDate] = [endDate, startDate];
      }
      
      // Check if selection is within max range
      const daysDiff = differenceInDays(endDate, startDate);
      if (maxSelectionRangeInDays && daysDiff > maxSelectionRangeInDays) {
        alert(`Selection cannot exceed ${maxSelectionRangeInDays} days`);
        return;
      }
      
      setSelectionState({
        startDate,
        endDate,
        selecting: false
      });
      
      // Notify parent component
      onSelection(startDate, endDate);
    }
  };

  // Handle mouse hover for preview
  const handleDateHover = (date: Date) => {
    if (selectionState.startDate && !selectionState.endDate) {
      setHoverDate(date);
    }
  };

  // Check if a date is in the selected range
  const isInRange = (date: Date): boolean => {
    if (!selectionState.startDate) return false;
    
    if (selectionState.startDate && selectionState.endDate) {
      return isWithinInterval(date, {
        start: selectionState.startDate,
        end: selectionState.endDate
      });
    }
    
    if (selectionState.startDate && hoverDate) {
      const start = isBefore(selectionState.startDate, hoverDate) ? selectionState.startDate : hoverDate;
      const end = isAfter(selectionState.startDate, hoverDate) ? selectionState.startDate : hoverDate;
      
      return isWithinInterval(date, { start, end });
    }
    
    return isSameDay(date, selectionState.startDate);
  };

  // Check if a date is the start or end of the range
  const isRangeEdge = (date: Date): 'start' | 'end' | null => {
    if (!selectionState.startDate) return null;
    
    if (isSameDay(date, selectionState.startDate)) {
      return 'start';
    }
    
    if (selectionState.endDate && isSameDay(date, selectionState.endDate)) {
      return 'end';
    }
    
    return null;
  };

  // Format the selected range for display
  const formatSelectedRange = () => {
    if (selectionState.startDate && selectionState.endDate) {
      return `${format(selectionState.startDate, 'dd MMM yyyy')} - ${format(selectionState.endDate, 'dd MMM yyyy')}`;
    }
    return '';
  };

  // Render calendar grid
  const calendarGrid = generateCalendarGrid();

  return (
    <Box sx={{ width: '100%', maxWidth: 350, borderRadius: 2, overflow: 'hidden' }}>
      {/* Calendar header */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        sx={{ 
          p: 2, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper
        }}
      >
        <IconButton onClick={handlePrevMonth} size="small" sx={{ color: theme.palette.primary.main }}>
          <ChevronLeftIcon />
        </IconButton>
        
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          {MONTHS[currentMonth]} {currentYear}
        </Typography>
        
        <IconButton onClick={handleNextMonth} size="small" sx={{ color: theme.palette.primary.main }}>
          <ChevronRightIcon />
        </IconButton>
      </Box>
      
      {/* Days of week header */}
      <Box sx={{ p: 1, backgroundColor: theme.palette.background.paper }}>
        <Grid container spacing={0}>
          {DAYS_OF_WEEK.map((day) => (
            <Grid item xs={12/7} key={day}>
              <Typography 
                variant="caption" 
                align="center" 
                display="block"
                sx={{ 
                  fontWeight: 'medium',
                  color: theme.palette.text.secondary,
                  py: 0.5
                }}
              >
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {/* Calendar grid */}
      <Box sx={{ p: 1, backgroundColor: theme.palette.background.paper }}>
        {calendarGrid.map((week, weekIndex) => (
          <Grid container spacing={0} key={weekIndex}>
            {week.map((date, dayIndex) => {
              if (!date) {
                // Empty cell
                return (
                  <Grid item xs={12/7} key={`empty-${weekIndex}-${dayIndex}`}>
                    <Box 
                      sx={{ 
                        height: 36, 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center' 
                      }}
                    />
                  </Grid>
                );
              }
              
              const dateString = format(date, 'yyyy-MM-dd');
              const isDisabled = isDateDisabled(date);
              const inRange = isInRange(date);
              const rangeEdge = isRangeEdge(date);
              const dateMessage = DATE_MESSAGES[dateString];
              const isToday = isSameDay(date, new Date());
              
              // Determine if this date is in the first or last position of its week
              const isFirstInWeek = dayIndex === 0;
              const isLastInWeek = dayIndex === 6;
              
              // Determine if this date is the first or last day in the range
              const isRangeStart = rangeEdge === 'start';
              const isRangeEnd = rangeEdge === 'end';
              
              const cellContent = (
                <Box 
                  sx={{
                    height: 36,
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    position: 'relative',
                    // Special styling for range
                    ...(inRange && !isRangeStart && !isRangeEnd && {
                      backgroundColor: theme.palette.primary.light,
                      opacity: 0.6,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: theme.palette.primary.light,
                        zIndex: -1,
                      }
                    }),
                    // Special styling for range edges
                    ...(isRangeStart && {
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '50%',
                        right: 0,
                        bottom: 0,
                        backgroundColor: theme.palette.primary.light,
                        opacity: 0.6,
                        zIndex: -1,
                      }
                    }),
                    ...(isRangeEnd && {
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: '50%',
                        bottom: 0,
                        backgroundColor: theme.palette.primary.light,
                        opacity: 0.6,
                        zIndex: -1,
                      }
                    }),
                    // Don't show the range background if it's at the edge of a week
                    ...((isRangeStart && isLastInWeek) && {
                      '&::before': { display: 'none' }
                    }),
                    ...((isRangeEnd && isFirstInWeek) && {
                      '&::before': { display: 'none' }
                    }),
                    '&:hover': {
                      backgroundColor: isDisabled ? undefined : (
                        (isRangeStart || isRangeEnd) ? theme.palette.primary.dark : 
                        inRange ? theme.palette.primary.main : 
                        theme.palette.action.hover
                      )
                    },
                    opacity: isDisabled ? 0.5 : 1,
                  }}
                  onClick={() => !isDisabled && handleDateClick(date)}
                  onMouseEnter={() => !isDisabled && handleDateHover(date)}
                >
                  <Box
                    sx={{
                      height: 36,
                      width: 36,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: '50%',
                      backgroundColor: (() => {
                        if (isRangeStart || isRangeEnd) {
                          return theme.palette.primary.main;
                        }
                        if (isToday) {
                          return theme.palette.action.selected;
                        }
                        return 'transparent';
                      })(),
                      color: (() => {
                        if (isRangeStart || isRangeEnd) {
                          return theme.palette.primary.contrastText;
                        }
                        if (inRange) {
                          return theme.palette.primary.dark;
                        }
                        if (isDisabled) {
                          return theme.palette.text.disabled;
                        }
                        return theme.palette.text.primary;
                      })(),
                      fontWeight: (() => {
                        if (isRangeStart || isRangeEnd || isToday) {
                          return 'bold';
                        }
                        return 'normal';
                      })(),
                      boxShadow: isToday ? `inset 0 0 0 1px ${theme.palette.primary.main}` : 'none',
                    }}
                  >
                    {date.getDate()}
                  </Box>
                </Box>
              );
              
              return (
                <Grid item xs={12/7} key={dateString}>
                  {dateMessage ? (
                    <Tooltip title={dateMessage.message} arrow placement="top">
                      {cellContent}
                    </Tooltip>
                  ) : cellContent}
                </Grid>
              );
            })}
          </Grid>
        ))}
      </Box>
      
      {/* Selected range display */}
      <Box 
        sx={{ 
          p: 2, 
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper
        }}
      >
        <TextField
          fullWidth
          size="small"
          value={formatSelectedRange()}
          placeholder="Select date range"
          InputProps={{
            readOnly: true,
            startAdornment: <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
          }}
          sx={{ 
            '& .MuiOutlinedInput-root': {
              borderRadius: 1
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default Calendar;
