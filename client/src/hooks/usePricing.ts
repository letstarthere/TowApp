import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface PricingParams {
  towType: 'flatbed' | 'hook';
  distanceInKm: number;
  vehicleType: string;
  userLocation: { latitude: number; longitude: number };
  destinationLocation: { latitude: number; longitude: number };
  premiumProvider?: string;
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
  };
}

export function usePricing(params: PricingParams | null) {
  const [pricing, setPricing] = useState<FareBreakdown | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!params) return;

    const calculatePricing = async () => {
      setLoading(true);
      try {
        const result = await apiRequest('POST', '/api/calculate-fare', params);
        
        let finalFare = result.totalFare;
        
        // Apply premium provider multiplier to final fare
        if (params.premiumProvider === 'Outsurance') {
          finalFare = finalFare * 1.15;
        } else if (params.premiumProvider === 'FirstHelp') {
          finalFare = finalFare * 1.18;
        }
        
        setPricing({
          ...result,
          totalFare: Math.round(finalFare * 100) / 100
        });
      } catch (error) {
        console.error('Error calculating pricing:', error);
        setPricing(null);
      } finally {
        setLoading(false);
      }
    };

    calculatePricing();
  }, [params]);

  return { pricing, loading };
}