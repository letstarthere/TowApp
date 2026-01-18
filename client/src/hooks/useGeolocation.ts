import { useState, useEffect } from "react";
import { Geolocation } from '@capacitor/geolocation';

interface GeolocationPosition {
  latitude: number;
  longitude: number;
}

export function useGeolocation() {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fallbackLocation = {
      latitude: -26.2041,
      longitude: 28.0473
    };

    const getLocation = async () => {
      try {
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000
        });
        
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setError(null);
        setIsLoading(false);

        const watchId = await Geolocation.watchPosition({
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000
        }, (position) => {
          if (position) {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          }
        });

        return () => {
          Geolocation.clearWatch({ id: watchId });
        };
      } catch (err) {
        console.error('Geolocation error:', err);
        setLocation(fallbackLocation);
        setError(null);
        setIsLoading(false);
      }
    };

    getLocation();
  }, []);

  return { location, error, isLoading };
}
