import { TextFieldProps } from "@mui/material";

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export interface CustomDateRangePickerProps {
  onRangeSelection: (startDate: Date, endDate: Date, timezone: string) => void;
  maxSelectionRangeInDays?: number;
  defaultTimezone?: string;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  textfieldSize?: TextFieldProps["size"];
}

export interface CalendarProps {
  year: number;
  month: number;
  onSelection: (startDate: Date, endDate: Date) => void;
  selectedRange: DateRange;
  maxSelectionRangeInDays?: number;
  timezone: string;
}

export interface TimezoneOption {
  label: string;
  value: string;
  offset: string;
}

export interface DateMessage {
  message: string;
  disabled: boolean;
}

export interface DataItem {
  id: number;
  employee: string;
  position: string;
  date: string;
  location: string;
  files: number;
  status: string;
}

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

export interface ColumnDefinition<T> {
  id: keyof T;
  label: string;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  renderCell?: (item: T) => React.ReactNode;
}
