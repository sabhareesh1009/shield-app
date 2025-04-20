import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Container, Typography, Box, Paper } from '@mui/material';
import DataDashboard from './components/DataDashboard';

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Shield Data Dashboard
          </Typography>
          <Paper elevation={3} sx={{ p: 3 }}>
            <DataDashboard />
          </Paper>
        </Box>
      </Container>
    </LocalizationProvider>
  );
}

export default App;
