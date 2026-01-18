// Mock types for UI development
export interface MockDriver {
  id: number;
  type: string;
  name: string;
  towType: 'hook' | 'flatbed';
  eta: string;
  rating: number;
  premiumProvider?: string;
  currentLatitude?: number;
  currentLongitude?: number;
  user?: {
    name: string;
    phone: string;
  };
  licensePlate?: string;
  vehicleType?: string;
}