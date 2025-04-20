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
