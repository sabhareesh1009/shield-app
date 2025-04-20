import axios from 'axios';
import { DataItem } from '../types/types';

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Function to fetch data for a specific date range
export const fetchDataForDateRange = async (startDate: string, endDate: string): Promise<DataItem[]> => {
  try {
    // Since JSONPlaceholder doesn't have date-based filtering, we'll fetch posts
    // and then transform them to match our data structure with random dates in the range
    const response = await api.get('/posts');
    
    // Parse the dates to create a range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Transform the data to match our DataItem interface
    const transformedData: DataItem[] = response.data.slice(0, 20).map((post: any, index: number) => {
      // Generate a random date within the selected range
      const randomDate = new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
      );
      
      // Format the date as YYYY-MM-DD
      const formattedDate = randomDate.toISOString().split('T')[0];
      
      // Generate a random status
      const statuses = ['Pending', 'Completed', 'In Progress', 'Cancelled'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        id: post.id,
        date: formattedDate,
        title: post.title.slice(0, 30),
        description: post.body.slice(0, 100),
        status: randomStatus
      };
    });
    
    // Sort by date
    transformedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// Function to simulate API error (for testing)
export const simulateApiError = async (): Promise<never> => {
  throw new Error('Simulated API error');
};

export default api;
