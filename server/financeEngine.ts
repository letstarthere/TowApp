import { db } from "./db";

interface FareCalculationParams {
  towType: 'flatbed' | 'hook';
  distanceInKm: number;
  vehicleType: 'sedan' | 'suv' | 'hatchback' | 'coupe' | 'bakkie' | 'van' | 'other';
  userLocation: { latitude: number; longitude: number };
  destinationLocation: { latitude: number; longitude: number };
}

interface FareBreakdown {
  baseFare: number;
  transactionFee: number;
  distanceCost: number;
  adjustedKmRate: number;
  bookingFee: number;
  totalFare: number;
  modifiers: {
    scarcity: number;
    weather: number;
    demand: number;
    vehicle: number;
    time: number;
  };
}

export async function calculateFare(params: FareCalculationParams): Promise<FareBreakdown> {
  const { towType, distanceInKm, vehicleType, userLocation } = params;
  
  // Base pricing
  const baseFare = 300;
  const transactionFee = 30;
  const baseKmRate = towType === 'hook' ? 20 : 22.5;
  
  // Calculate modifiers
  const scarcityModifier = await calculateScarcityModifier(userLocation);
  const weatherModifier = await calculateWeatherModifier(userLocation);
  const demandModifier = await calculateDemandModifier(userLocation);
  const vehicleModifier = calculateVehicleModifier(vehicleType);
  const timeModifier = calculateTimeModifier();
  
  // Apply modifiers to per-km rate only
  const adjustedKmRate = baseKmRate * scarcityModifier * weatherModifier * demandModifier * vehicleModifier * timeModifier;
  const distanceCost = adjustedKmRate * distanceInKm;
  
  // Calculate totals
  const tripSubtotal = baseFare + transactionFee + distanceCost;
  const bookingFee = tripSubtotal * 0.08;
  const totalFare = tripSubtotal + bookingFee;
  
  return {
    baseFare,
    transactionFee,
    distanceCost: Math.round(distanceCost * 100) / 100,
    adjustedKmRate: Math.round(adjustedKmRate * 100) / 100,
    bookingFee: Math.round(bookingFee * 100) / 100,
    totalFare: Math.round(totalFare * 100) / 100,
    modifiers: {
      scarcity: scarcityModifier,
      weather: weatherModifier,
      demand: demandModifier,
      vehicle: vehicleModifier,
      time: timeModifier
    }
  };
}

async function calculateScarcityModifier(userLocation: { latitude: number; longitude: number }): Promise<number> {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const activeRequests = await db.request.count({
      where: {
        createdAt: { gte: fiveMinutesAgo },
        status: { in: ['PENDING', 'ACCEPTED'] }
      }
    });
    
    if (activeRequests <= 2) return 1.25;
    if (activeRequests <= 5) return 1.15;
    return 1.0;
  } catch (error) {
    console.error('Error calculating scarcity modifier:', error);
    return 1.0;
  }
}

async function calculateWeatherModifier(userLocation: { latitude: number; longitude: number }): Promise<number> {
  try {
    // Mock weather check - in production, use OpenWeatherMap API
    const weatherConditions = ['clear', 'cloudy', 'rain', 'storm'];
    const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    
    if (['rain', 'storm', 'snow'].includes(randomCondition)) {
      return 1.15;
    }
    return 1.0;
  } catch (error) {
    console.error('Error calculating weather modifier:', error);
    return 1.0;
  }
}

async function calculateDemandModifier(userLocation: { latitude: number; longitude: number }): Promise<number> {
  try {
    const activeTrucks = await db.driver.count({
      where: {
        isAvailable: true,
        currentLatitude: { not: null },
        currentLongitude: { not: null }
      }
    });
    
    return activeTrucks < 3 ? 1.10 : 1.0;
  } catch (error) {
    console.error('Error calculating demand modifier:', error);
    return 1.0;
  }
}

function calculateVehicleModifier(vehicleType: string): number {
  const multipliers: Record<string, number> = {
    sedan: 1.0,
    hatchback: 1.0,
    coupe: 1.0,
    suv: 1.2,
    bakkie: 1.2,
    van: 1.2,
    other: 1.0
  };
  
  return multipliers[vehicleType.toLowerCase()] || 1.0;
}

function calculateTimeModifier(): number {
  const now = new Date();
  const hour = now.getHours();
  
  if (hour >= 6 && hour <= 18) {
    return 1.0; // Normal hours
  } else if (hour >= 19 && hour <= 21) {
    return 1.1; // Evening
  } else if (hour >= 22 || hour <= 4) {
    return 1.25; // Late night / after-hours
  } else if (hour === 5) {
    return 1.15; // Early morning
  }
  
  return 1.0; // Fallback
}