import { useEffect, useRef, useState } from "react";
import { Truck, MapPin } from "lucide-react";
import type { DriverWithUser, RequestWithDetails } from "@/lib/types";

interface MapProps {
  center?: { lat: number; lng: number };
  drivers: DriverWithUser[];
  userLocation?: { latitude: number; longitude: number } | null;
  isDriver?: boolean;
  requests?: RequestWithDetails[];
  onDriverClick?: (driver: DriverWithUser) => void;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function Map({ 
  center, 
  drivers, 
  userLocation, 
  isDriver = false, 
  requests = [],
  onDriverClick 
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        const response = await fetch('/api/config/maps');
        const config = await response.json();
        
        if (!config.apiKey) {
          console.error('Google Maps API key not configured');
          return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}&callback=initMap`;
        script.async = true;
        script.defer = true;
        
        window.initMap = () => {
          setIsLoaded(true);
        };
        
        document.head.appendChild(script);
        
        return () => {
          if (document.head.contains(script)) {
            document.head.removeChild(script);
          }
        };
      } catch (error) {
        console.error('Failed to load Google Maps:', error);
      }
    };

    loadGoogleMaps();
  }, []);

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google) return;

    const defaultCenter = center || 
      (userLocation ? { lat: userLocation.latitude, lng: userLocation.longitude } : 
      { lat: -26.2041, lng: 28.0473 }); // Johannesburg default

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 13,
      styles: [
        {
          "featureType": "poi",
          "elementType": "labels",
          "stylers": [{ "visibility": "off" }]
        }
      ]
    });

    setMap(mapInstance);
  }, [isLoaded, center, userLocation]);

  // Update markers when data changes
  useEffect(() => {
    if (!map || !window.google) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    const newMarkers: any[] = [];

    // Add user location marker
    if (userLocation) {
      const userMarker = new window.google.maps.Marker({
        position: { lat: userLocation.latitude, lng: userLocation.longitude },
        map: map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: isDriver ? '#ff7b29' : '#3b82f6',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2,
        },
        title: isDriver ? 'Your Location' : 'You are here'
      });
      newMarkers.push(userMarker);
    }

    // Add driver markers for users
    if (!isDriver) {
      drivers.forEach((driver, index) => {
        if (driver.currentLatitude && driver.currentLongitude) {
          const position = {
            lat: parseFloat(driver.currentLatitude.toString()),
            lng: parseFloat(driver.currentLongitude.toString())
          };

          const driverMarker = new window.google.maps.Marker({
            position: position,
            map: map,
            icon: {
              url: 'data:image/svg+xml;base64,' + btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#ff7b29">
                  <path d="M20 8h-3V4H3C1.89 4 1 4.89 1 6v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2V10l-3-2zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96.54L19 11.5V9.5l.5-1zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(32, 32),
            },
            title: `${driver.user.name} - ${driver.vehicleType}`
          });

          driverMarker.addListener('click', () => {
            onDriverClick?.(driver);
          });

          newMarkers.push(driverMarker);
        }
      });
    }

    // Add request markers for drivers
    if (isDriver) {
      requests.forEach((request) => {
        const position = {
          lat: parseFloat(request.pickupLatitude.toString()),
          lng: parseFloat(request.pickupLongitude.toString())
        };

        const requestMarker = new window.google.maps.Marker({
          position: position,
          map: map,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#ef4444',
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 2,
          },
          title: `Pickup: ${request.pickupAddress}`,
          animation: window.google.maps.Animation.BOUNCE
        });

        newMarkers.push(requestMarker);
      });
    }

    setMarkers(newMarkers);
  }, [map, drivers, userLocation, isDriver, requests, onDriverClick]);

  // Center map on user location when it changes
  useEffect(() => {
    if (map && userLocation) {
      map.setCenter({ lat: userLocation.latitude, lng: userLocation.longitude });
    }
  }, [map, userLocation]);

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-towapp-orange border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={mapRef} className="w-full h-full relative bg-gray-200">
      {/* Fallback for when Google Maps fails to load */}
      <div className="absolute inset-0 flex items-center justify-center bg-gray-100" style={{ zIndex: -1 }}>
        <p className="text-gray-600">Map loading...</p>
      </div>
    </div>
  );
}
