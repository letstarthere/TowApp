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
    let retryInterval: NodeJS.Timeout;
    let mounted = true;

    const getLocation = async () => {
      if (!mounted) return;
      
      try {
        const permissions = await Geolocation.checkPermissions();
        console.log('Permission status:', permissions.location);
        
        if (permissions.location !== 'granted') {
          const result = await Geolocation.requestPermissions();
          console.log('Permission request result:', result.location);
          if (result.location !== 'granted') {
            setError('Location permission denied');
            setIsLoading(false);
            return;
          }
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
          console.log('Location obtained:', position.coords.latitude, position.coords.longitude);
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
            setError(null);
          }
        });
      } catch (err: any) {
        console.error('Geolocation error:', err);
        if (mounted) {
          setError('Unable to get location');
          setIsLoading(false);
        }
      }
    };

    getLocation();
    retryInterval = setInterval(() => {
      if (!location && mounted) {
        console.log('Retrying location...');
        getLocation();
      }
    }, 5000);

    return () => {
      mounted = false;
      if (watchId) Geolocation.clearWatch({ id: watchId });
      if (retryInterval) clearInterval(retryInterval);
    };
  }, []);

  return { location, error, isLoading };
}
