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
    const getLocation = async () => {
      try {
        const permissions = await Geolocation.checkPermissions();
        if (permissions.location !== 'granted') {
          await Geolocation.requestPermissions();
        }

        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
        
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setError(null);
        setIsLoading(false);

        const watchId = await Geolocation.watchPosition({
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
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
        setError('Unable to get location');
        setIsLoading(false);
      }
    };

    getLocation();
  }, []);

  return { location, error, isLoading };
}
