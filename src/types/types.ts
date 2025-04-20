export interface DataItem {
  id: number;
  date: string;
  title: string;
  description: string;
  status: string;
}

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}
