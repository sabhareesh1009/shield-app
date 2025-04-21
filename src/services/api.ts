import axios from 'axios';
import { DataItem } from '../types';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'https://dummyjson.com/c/da7a-e621-496e-9322',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Function to fetch data for a specific date range
export const fetchDataForDateRange = async (startDate: string, endDate: string): Promise<DataItem[]> => {
  try {
    // Fetch data from the dummyjson endpoint
    const response = await api.get('/users');
    const users = response?.data?.users || [];
    
    // Parse the dates to create a range
    // Convert from dd/mm/yyyy format if needed
    const parseDate = (dateStr: string) => {
      if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        return new Date(`${year}-${month}-${day}`);
      }
      return new Date(dateStr);
    };
    
    const start = parseDate(startDate);
    const end = parseDate(endDate);

    
    // Transform the data to match our DataItem interface
    const transformedData: DataItem[] = users.map((user: any) => {
      // Generate a random date within the selected range
      const randomDate = new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
      );
      
      // Format the date as dd/mm/yyyy
      const day = randomDate.getDate().toString().padStart(2, '0');
      const month = (randomDate.getMonth() + 1).toString().padStart(2, '0');
      const year = randomDate.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      

      return {
        id: user.id,
        employee: user.employee,
        position: user.position,
        date: formattedDate,
        location: user.location,
        files: user.files,
        status: user.status
      };
    });
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
};

export default api;
