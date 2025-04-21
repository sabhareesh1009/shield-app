import React, { useState } from 'react';
import {
  Box,
  TextField,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Popover,
  Button,
  ClickAwayListener,
  SelectChangeEvent,
  InputAdornment
} from '@mui/material';
import { subDays } from 'date-fns';
import Calendar from './Calendar';
import { CustomDateRangePickerProps, DateRange, TimezoneOption } from '../../types/types';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PublicIcon from '@mui/icons-material/Public';

// Define timezone options
const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { label: 'Asia/Calcutta (GMT+5:30)', value: 'Asia/Calcutta', offset: '+5:30' },
  { label: 'Asia/Dubai (GMT+4)', value: 'Asia/Dubai', offset: '+4' },
  { label: 'Europe/Moscow (GMT+3)', value: 'Europe/Moscow', offset: '+3' },
  { label: 'Europe/London (GMT+0)', value: 'Europe/London', offset: '+0' },
  { label: 'America/New_York (GMT-5)', value: 'America/New_York', offset: '-5' },
  { label: 'America/Los_Angeles (GMT-8)', value: 'America/Los_Angeles', offset: '-8' },
];

const CustomDateRangePicker: React.FC<CustomDateRangePickerProps> = ({
  onRangeSelection,
  maxSelectionRangeInDays = 10,
  defaultTimezone = 'Asia/Calcutta',
  disabled = false,
  label = 'Select Date Range',
  placeholder = 'Select date range',
  error = false,
  helperText = '',
  textfieldSize = "medium",
}) => {
  // Default date range: 7 days ago to today
  const defaultStartDate = subDays(new Date(), 7);
  const defaultEndDate = new Date();
  
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    startDate: defaultStartDate,
    endDate: defaultEndDate
  });
  const [timezone, setTimezone] = useState<string>(defaultTimezone);
  const [timezoneOffset, setTimezoneOffset] = useState<string>(
    TIMEZONE_OPTIONS.find(tz => tz.value === defaultTimezone)?.offset || '+5:30'
  );
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  
  // Format the date range for display
  const formatDateRange = () => {
    const { startDate, endDate } = selectedRange;
    if (!startDate || !endDate) return '';
    
    // Format dates in dd/MM/yyyy format
    const formatDate = (date: Date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };
    
    const formattedStart = formatDate(startDate);
    const formattedEnd = formatDate(endDate);
    
    return `${formattedStart} - ${formattedEnd} GMT${timezoneOffset}`;
  };

  // Handle date range selection
  const handleRangeSelection = (startDate: Date, endDate: Date) => {
    setSelectedRange({ startDate, endDate });
    onRangeSelection(startDate, endDate, timezone);
  };

  // Handle timezone change
  const handleTimezoneChange = (event: SelectChangeEvent<string>) => {
    const newTimezone = event.target.value;
    setTimezone(newTimezone);
    
    const newOffset = TIMEZONE_OPTIONS.find(tz => tz.value === newTimezone)?.offset || '+0';
    setTimezoneOffset(newOffset);
    
    // Notify parent component about the change
    if (selectedRange.startDate && selectedRange.endDate) {
      onRangeSelection(selectedRange.startDate, selectedRange.endDate, newTimezone);
    }
  };

  // Handle opening the date picker
  const handleOpenPicker = (event: React.MouseEvent<HTMLElement>) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
      setIsPickerOpen(true);
    }
  };

  // Handle closing the date picker
  const handleClosePicker = () => {
    setAnchorEl(null);
    setIsPickerOpen(false);
  };
  
  // Handle apply button click
  const handleApply = () => {
    if (selectedRange.startDate && selectedRange.endDate) {
      onRangeSelection(selectedRange.startDate, selectedRange.endDate, timezone);
      handleClosePicker();
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      {label && (
        <Typography variant="h6" gutterBottom>
          {label}
        </Typography>
      )}
      
      <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
        {/* Date Range Display */}
        <TextField
          variant="outlined"
          size={textfieldSize}
          value={formatDateRange()}
          onClick={handleOpenPicker}
          InputProps={{
            readOnly: true,
            startAdornment: (
              <InputAdornment position="start">
                <CalendarTodayIcon color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder={placeholder}
          disabled={disabled}
          error={error}
          helperText={helperText}
          sx={{
            width: "320px",
            '& .MuiOutlinedInput-root': {
              borderRadius: 1,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: theme => theme.palette.primary.main,
              },
            },
          }}
        />
        
        {/* Timezone Selector */}
        <FormControl variant="outlined" size={textfieldSize} sx={{ width: "300px" }}>
          <InputLabel>Timezone</InputLabel>
          <Select
            value={timezone}
            onChange={handleTimezoneChange}
            label="Timezone"
            disabled={disabled}
            startAdornment={
              <InputAdornment position="start">
                <PublicIcon color="primary" />
              </InputAdornment>
            }
          >
            {TIMEZONE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      {/* Date Range Picker Popover */}
      <Popover
        open={isPickerOpen}
        anchorEl={anchorEl}
        onClose={handleClosePicker}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          elevation: 3,
          sx: { borderRadius: 2 }
        }}
      >
        <ClickAwayListener onClickAway={handleClosePicker}>
          <Paper sx={{ p: 0, width: 350, overflow: 'hidden' }}>
            <Calendar
              year={new Date().getFullYear()}
              month={new Date().getMonth()}
              onSelection={handleRangeSelection}
              selectedRange={selectedRange}
              maxSelectionRangeInDays={maxSelectionRangeInDays}
              timezone={timezone}
            />
            
            <Box 
              display="flex" 
              justifyContent="flex-end" 
              gap={2} 
              sx={{ 
                p: 2, 
                borderTop: theme => `1px solid ${theme.palette.divider}`,
                backgroundColor: theme => theme.palette.background.paper
              }}
            >
              <Button 
                onClick={handleClosePicker} 
                color="primary" 
                variant="outlined" 
                size='small'
                sx={{ borderRadius: 1 }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleApply} 
                color="primary" 
                variant='contained' 
                size='small'
                sx={{ borderRadius: 1 }}
              >
                Apply
              </Button>
            </Box>
          </Paper>
        </ClickAwayListener>
      </Popover>
    </Box>
  );
};

export default CustomDateRangePicker;
