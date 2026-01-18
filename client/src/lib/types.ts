export type {
  User,
  Driver,
  Request,
  UserWithDriver,
  DriverWithUser,
  RequestWithDetails,
} from "@shared/schema";

export interface MockDriver {
  id: number;
  type: 'standard' | 'premium';
  name: string;
  towType: 'hook' | 'flatbed';
  eta: string;
  rating: number;
  currentLatitude?: number;
  currentLongitude?: number;
  user?: {
    name: string;
    phone: string;
  };
  vehicleType?: string;
  licensePlate?: string;
  premiumProvider?: string;
}
