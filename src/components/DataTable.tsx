import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  TextField,
  InputAdornment,
  TableSortLabel,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  IconButton,
  Chip,
  Tooltip,
  Avatar,
  useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { ColumnDefinition } from '../types';

type Order = 'asc' | 'desc';

export interface DataTableProps<T extends { id: number }> {
  data: T[];
  columns: ColumnDefinition<T>[];
  loading: boolean;
  initialSortBy?: keyof T;
  initialSortDirection?: Order;
  searchableColumns?: Array<keyof T>;
  defaultSearchColumn?: keyof T;
  enableFavorites?: boolean;
}

const AVATAR_COLORS = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4'];

function DataTable<T extends { id: number }>({ 
  data, 
  columns, 
  loading, 
  initialSortBy,
  initialSortDirection = 'desc',
  searchableColumns,
  defaultSearchColumn,
  enableFavorites = false
}: DataTableProps<T>) {
  const theme = useTheme();
  const [filteredData, setFilteredData] = useState<T[]>(data);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchColumn, setSearchColumn] = useState<keyof T | undefined>(defaultSearchColumn || (searchableColumns && searchableColumns.length > 0 ? searchableColumns[0] : undefined));
  const [orderBy, setOrderBy] = useState<keyof T | undefined>(initialSortBy);
  const [order, setOrder] = useState<Order>(initialSortDirection);
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!searchTerm || !searchColumn) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter(item => {
      const value = item[searchColumn];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      } else if (typeof value === 'number') {
        return value.toString().includes(searchTerm);
      }
      return false;
    });

    setFilteredData(filtered);
  }, [data, searchTerm, searchColumn]);

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Handle search column change
  const handleSearchColumnChange = (event: SelectChangeEvent<unknown>) => {
    setSearchColumn(event.target.value as keyof T);
  };

  // Handle sort request
  const handleRequestSort = (property: keyof T) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Toggle favorite status
  const toggleFavorite = (id: number) => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Get avatar color based on name
  const getAvatarColor = (name: string) => {
    const charCode = name.charCodeAt(0);
    return AVATAR_COLORS[charCode % AVATAR_COLORS.length];
  };

  // Get initials from name
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`;
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Sort function
  const sortData = (data: T[]): T[] => {
    if (!orderBy) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];

      if (order === 'asc') {
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return aValue.localeCompare(bValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          return aValue - bValue;
        }
        return String(aValue).localeCompare(String(bValue));
      } else {
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return bValue.localeCompare(aValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          return bValue - aValue;
        }
        return String(bValue).localeCompare(String(aValue));
      }
    });
  };

  // Get sorted and filtered data
  const sortedData = sortData(filteredData);

  // Format date helper function
  const formatDate = (dateString: string) => {
    const dateParts = dateString.split('/');
    if (dateParts.length === 3) {
      return `${dateParts[0]} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(dateParts[1])-1]} ${dateParts[2]}`;
    }
    return dateString;
  };

  // Render cell content based on column definition
  const renderCellContent = (item: T, column: ColumnDefinition<T>) => {
    if (column.renderCell) {
      return column.renderCell(item);
    }

    const value = item[column.id];
    
    if (typeof value === 'string') {
      if (column.id === 'date' || column.id.toString().includes('date')) {
        return <Typography variant="body2">{formatDate(value as string)}</Typography>;
      }
      
      if (column.id === 'status') {
        return (
          <Chip
            label={value}
            size="small"
            sx={{
              borderRadius: '4px',
              backgroundColor: 
                value === 'Active' ? '#e6f7ed' :
                value === 'Pending' ? '#fff8e6' :
                value === 'Inactive' ? '#ffebee' :
                '#e3f2fd',
              color: 
                value === 'Active' ? '#1e8e3e' :
                value === 'Pending' ? '#f9a825' :
                value === 'Inactive' ? '#d32f2f' :
                '#1976d2',
              fontWeight: 500,
              fontSize: '0.75rem',
              px: 1,
            }}
          />
        );
      }
      
      if (column.id === 'employee') {
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: getAvatarColor(value as string),
                fontSize: '0.875rem'
              }}
            >
              {getInitials(value as string)}
            </Avatar>
            <Typography variant="body2">{value}</Typography>
          </Box>
        );
      }
      
      if (column.id === 'location') {
        return (
          <Box display="flex" alignItems="center" gap={0.5}>
            <LocationOnIcon fontSize="small" color="disabled" />
            <Typography variant="body2">{value}</Typography>
          </Box>
        );
      }
    }
    
    return <Typography variant="body2">{String(value)}</Typography>;
  };

  return (
    <Box>
      {(searchableColumns && searchableColumns.length > 0) && (
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="space-between"
          sx={{ 
            mb: 2,
            px: 2,
            py: 1,
            borderRadius: 1,
            bgcolor: 'background.paper',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <Box display="flex" alignItems="center" gap={1} sx={{ width: '60%' }}>
            <TextField
              placeholder="Search..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" fontSize="small" />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 1,
                  bgcolor: theme.palette.background.default,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'transparent'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.light
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main
                  }
                }
              }}
            />
            {searchableColumns.length > 1 && (
              <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={searchColumn as string}
                  onChange={handleSearchColumnChange}
                  displayEmpty
                  sx={{
                    borderRadius: 1,
                    bgcolor: theme.palette.background.default,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.light
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main
                    }
                  }}
                >
                  {searchableColumns.map((column) => (
                    <MenuItem key={column.toString()} value={column.toString()}>
                      {columns.find(col => col.id === column)?.label || column.toString()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <Tooltip title="Filter options">
              <IconButton size="small" sx={{ bgcolor: theme.palette.background.default }}>
                <FilterListIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary">
              Showing {sortedData.length} of {data.length} items
            </Typography>
          </Box>
        </Box>
      )}
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress size={40} thickness={4} />
        </Box>
      ) : sortedData.length > 0 ? (
        <TableContainer 
          component={Paper} 
          sx={{ 
            boxShadow: 'none',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            overflowX: 'auto'
          }}
        >
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.background.default }}>
                {columns.map((column) => (
                  <TableCell 
                    key={column.id.toString()} 
                    align={column.align || 'left'}
                    width={column.width}
                    sx={{ fontWeight: 'bold', color: theme.palette.text.secondary, py: 1.5 }}
                  >
                    {column.sortable !== false ? (
                      <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? order : 'asc'}
                        onClick={() => handleRequestSort(column.id)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
                {enableFavorites && (
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.secondary, py: 1.5, width: 50 }}>
                    Star
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((item) => (
                <TableRow 
                  key={item.id}
                  sx={{ 
                    '&:hover': { bgcolor: theme.palette.action.hover },
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}
                >
                  {columns.map((column) => (
                    <TableCell 
                      key={`${item.id}-${column.id.toString()}`} 
                      align={column.align || 'left'}
                      sx={{ py: 1.5 }}
                    >
                      {renderCellContent(item, column)}
                    </TableCell>
                  ))}
                  {enableFavorites && (
                    <TableCell sx={{ py: 1.5 }}>
                      <IconButton 
                        size="small" 
                        onClick={() => toggleFavorite(item.id)}
                        sx={{ color: favorites[item.id] ? '#f9a825' : 'inherit' }}
                      >
                        {favorites[item.id] ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          py={6}
          sx={{ 
            border: `1px dashed ${theme.palette.divider}`,
            borderRadius: 1,
            bgcolor: theme.palette.background.default
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No results found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filter to find what you're looking for.
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default DataTable;
