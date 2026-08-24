import type { MockData } from '../types';

const MOCK_DATA_URL = '/mock-data.json';

let cachedData: MockData | null = null;

/**
 * Fetches and caches mock data from the public JSON file.
 * Simulates a backend API response with a consistent interface.
 */
export const fetchMockData = async (): Promise<MockData> => {
  if (cachedData) {
    return cachedData;
  }

  const response = await fetch(MOCK_DATA_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch mock data: ${response.status} ${response.statusText}`);
  }

  const data: MockData = await response.json();
  cachedData = data;
  return data;
};

/**
 * Clears the cached mock data. Useful for testing.
 */
export const clearMockDataCache = (): void => {
  cachedData = null;
};
