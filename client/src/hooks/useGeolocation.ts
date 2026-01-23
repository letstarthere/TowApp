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
    let mounted = true;

    const getLocation = async () => {
      if (!mounted) return;
      
      try {
        const permissions = await Geolocation.checkPermissions();
        
        if (permissions.location !== 'granted') {
          await Geolocation.requestPermissions();
        }

        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        });
        
        if (mounted) {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setError(null);
          setIsLoading(false);
        }

        watchId = await Geolocation.watchPosition({
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }, (position) => {
          if (position && mounted) {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          }
        });
      } catch (err: any) {
        console.error('Geolocation error:', err);
        if (mounted) {
          setLocation({ latitude: -26.2041, longitude: 28.0473 });
          setError(null);
          setIsLoading(false);
        }
      }
    };

    getLocation();

    return () => {
      mounted = false;
      if (watchId) Geolocation.clearWatch({ id: watchId });
    };
  }, []);

  return { location, error, isLoading };
}
