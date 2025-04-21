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
import { DataItem } from '../types';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import LocationOnIcon from '@mui/icons-material/LocationOn';

type Order = 'asc' | 'desc';
type SortableColumns = keyof Pick<DataItem, 'id' | 'employee' | 'date' | 'position' | 'location' | 'status'>;

interface EnhancedDataTableProps {
  data: DataItem[];
  loading: boolean;
}

// Sample avatar colors for consistent user avatars
const AVATAR_COLORS = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4'];

const EnhancedDataTable: React.FC<EnhancedDataTableProps> = ({ data, loading }) => {
  const theme = useTheme();
  const [filteredData, setFilteredData] = useState<DataItem[]>(data);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchColumn, setSearchColumn] = useState<keyof DataItem>('employee');
  const [orderBy, setOrderBy] = useState<SortableColumns>('date');
  const [order, setOrder] = useState<Order>('desc');
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});

  // Update filtered data when data, search term, or search column changes
  useEffect(() => {
    if (!searchTerm) {
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
    setSearchColumn(event.target.value as keyof DataItem);
  };

  // Handle sort request
  const handleRequestSort = (property: SortableColumns) => {
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
  const sortData = (data: DataItem[]): DataItem[] => {
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

  return (
    <Box>
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
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <Select
              value={searchColumn}
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
              <MenuItem value="employee">Employee</MenuItem>
              <MenuItem value="location">Location</MenuItem>
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="position">Position</MenuItem>
            </Select>
          </FormControl>
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
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.secondary, py: 1.5 }}>
                  <TableSortLabel
                    active={orderBy === 'id'}
                    direction={orderBy === 'id' ? order : 'asc'}
                    onClick={() => handleRequestSort('id')}
                  >
                    ID
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.secondary, py: 1.5 }}>
                  <TableSortLabel
                    active={orderBy === 'employee'}
                    direction={orderBy === 'employee' ? order : 'asc'}
                    onClick={() => handleRequestSort('employee')}
                  >
                    Employee
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.secondary, py: 1.5 }}>
                  <TableSortLabel
                    active={orderBy === 'position'}
                    direction={orderBy === 'position' ? order : 'asc'}
                    onClick={() => handleRequestSort('position')}
                  >
                    Position
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.secondary, py: 1.5 }}>
                  <TableSortLabel
                    active={orderBy === 'date'}
                    direction={orderBy === 'date' ? order : 'asc'}
                    onClick={() => handleRequestSort('date')}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.secondary, py: 1.5 }}>
                  Last activity
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.secondary, py: 1.5 }}>
                  <TableSortLabel
                    active={orderBy === 'location'}
                    direction={orderBy === 'location' ? order : 'asc'}
                    onClick={() => handleRequestSort('location')}
                  >
                    Location
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.secondary, py: 1.5 }}>
                  Files
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.secondary, py: 1.5 }}>
                  Star
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.secondary, py: 1.5 }}>
                  <TableSortLabel
                    active={orderBy === 'status'}
                    direction={orderBy === 'status' ? order : 'asc'}
                    onClick={() => handleRequestSort('status')}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((item: DataItem, index) => {
                // Use employee name from the data
                const name = item.employee;
                // Parse and format date for display
                const dateParts = item.date.split('/');
                const formattedDate = dateParts.length === 3 ? 
                  `${dateParts[0]} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(dateParts[1])-1]} ${dateParts[2]}` :
                  item.date;
                
                return (
                  <TableRow 
                    key={item.id}
                    sx={{ 
                      '&:hover': { bgcolor: theme.palette.action.hover },
                      borderBottom: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    <TableCell sx={{ py: 1.5 }}>{item.id}</TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            bgcolor: getAvatarColor(name),
                            fontSize: '0.875rem'
                          }}
                        >
                          {getInitials(name)}
                        </Avatar>
                        <Typography variant="body2">{name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium', color: theme.palette.text.primary }}>
                        {item.position}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2">{formattedDate}</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2">{formattedDate}</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <LocationOnIcon fontSize="small" color="disabled" />
                        <Typography variant="body2">{item.location}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2">{item.files}</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <IconButton 
                        size="small" 
                        onClick={() => toggleFavorite(item.id)}
                        sx={{ color: favorites[item.id] ? '#f9a825' : 'inherit' }}
                      >
                        {favorites[item.id] ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                      </IconButton>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        label={item.status}
                        size="small"
                        sx={{
                          borderRadius: '4px',
                          backgroundColor: 
                            item.status === 'Active' ? '#e6f7ed' :
                            item.status === 'Pending' ? '#fff8e6' :
                            item.status === 'Inactive' ? '#ffebee' :
                            '#e3f2fd',
                          color: 
                            item.status === 'Active' ? '#1e8e3e' :
                            item.status === 'Pending' ? '#f9a825' :
                            item.status === 'Inactive' ? '#d32f2f' :
                            '#1976d2',
                          fontWeight: 500,
                          fontSize: '0.75rem',
                          px: 1,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
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
};

export default EnhancedDataTable;
