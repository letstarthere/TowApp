// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || '';
export const USE_MOCK_DATA = !API_URL || API_URL === '';

export function getApiUrl(path: string): string {
  if (USE_MOCK_DATA) {
    return path; // Return path as-is for mock mode
  }
  return `${API_URL}${path}`;
}
