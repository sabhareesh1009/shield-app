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
type SortableColumns = 'id' | 'date' | 'title' | 'status';

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
  const [searchColumn, setSearchColumn] = useState<keyof DataItem>('title');
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
        if (aValue < bValue) return -1;
        if (aValue > bValue) return 1;
        return 0;
      } else {
        if (aValue > bValue) return -1;
        if (aValue < bValue) return 1;
        return 0;
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
              <MenuItem value="id">ID</MenuItem>
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="title">Title</MenuItem>
              <MenuItem value="description">Description</MenuItem>
              <MenuItem value="status">Status</MenuItem>
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
            overflow: 'hidden'
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
                  Employee
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.secondary, py: 1.5 }}>
                  <TableSortLabel
                    active={orderBy === 'title'}
                    direction={orderBy === 'title' ? order : 'asc'}
                    onClick={() => handleRequestSort('title')}
                  >
                    Position
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.secondary, py: 1.5 }}>
                  Contact
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.secondary, py: 1.5 }}>
                  <TableSortLabel
                    active={orderBy === 'date'}
                    direction={orderBy === 'date' ? order : 'asc'}
                    onClick={() => handleRequestSort('date')}
                  >
                    Start date
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.secondary, py: 1.5 }}>
                  Last activity
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.secondary, py: 1.5 }}>
                  Location
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
                // Generate some mock data based on the existing data
                const name = item.title.split(' ').slice(0, 2).join(' ');
                const email = name.toLowerCase().replace(' ', '.') + '@example.com';
                const position = ['CEO', 'CFO', 'CTO', 'Designer', 'Developer', 'Marketing', 'HR'][index % 7];
                const location = ['Paris', 'New York', 'London', 'Tokyo', 'Berlin', 'Sydney'][index % 6];
                const files = Math.floor(Math.random() * 5) + 1;
                
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
                        {position}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {email}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2">{item.date}</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2">{item.date}</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <LocationOnIcon fontSize="small" color="disabled" />
                        <Typography variant="body2">{location}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2">{files}</Typography>
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
                            item.status === 'Completed' ? '#e6f7ed' :
                            item.status === 'Pending' ? '#fff8e6' :
                            item.status === 'In Progress' ? '#e3f2fd' :
                            '#ffebee',
                          color: 
                            item.status === 'Completed' ? '#1e8e3e' :
                            item.status === 'Pending' ? '#f9a825' :
                            item.status === 'In Progress' ? '#1976d2' :
                            '#d32f2f',
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
          justifyContent="center" 
          alignItems="center" 
          height={200} 
          bgcolor="background.paper"
          borderRadius={1}
          border={`1px solid ${theme.palette.divider}`}
        >
          <Typography variant="body1" color="text.secondary">
            No data found matching your search criteria
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default EnhancedDataTable;
