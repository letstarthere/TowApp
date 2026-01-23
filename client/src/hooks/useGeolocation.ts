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
    let watchId: string;
    let retryTimeout: NodeJS.Timeout;

    const getLocation = async () => {
      try {
        const permissions = await Geolocation.checkPermissions();
        if (permissions.location !== 'granted') {
          const result = await Geolocation.requestPermissions();
          if (result.location !== 'granted') {
            setError('Location permission denied');
            setIsLoading(false);
            return;
          }
        }

        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
        
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setError(null);
        setIsLoading(false);

        watchId = await Geolocation.watchPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }, (position) => {
          if (position) {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            setError(null);
          }
        });
      } catch (err) {
        console.error('Geolocation error:', err);
        setError('Unable to get location');
        setIsLoading(false);
        retryTimeout = setTimeout(() => getLocation(), 3000);
      }
    };

    getLocation();

    return () => {
      if (watchId) Geolocation.clearWatch({ id: watchId });
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, []);

  return { location, error, isLoading };
}
