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
  selectedDriver?: DriverWithUser | null;
  isMinimized?: boolean;
  destination?: string;
  driverLocation?: { latitude: number; longitude: number };
  showRoute?: boolean;
  routePhase?: 'pickup' | 'delivery';
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
  onDriverClick,
  selectedDriver,
  isMinimized = false,
  destination,
  driverLocation,
  showRoute = false,
  routePhase = 'pickup'
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentDirections, setCurrentDirections] = useState<any>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);
  const [destinationMarker, setDestinationMarker] = useState<any>(null);
  const [distanceLabel, setDistanceLabel] = useState<any>(null);

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
        script.src = `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}&libraries=places,geometry&callback=initMap`;
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
      ],
      gestureHandling: 'greedy',
      zoomControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      disableDefaultUI: true,
      clickableIcons: false,
      keyboardShortcuts: false
    });

    // Initialize DirectionsRenderer
    const renderer = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#f97316', // Orange color
        strokeWeight: 6,
        strokeOpacity: 0.9
      },
      preserveViewport: true
    });
    renderer.setMap(mapInstance);
    setDirectionsRenderer(renderer);

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
          scale: 12,
          fillColor: '#f97316', // Orange color
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 3,
        },
        title: 'Your location',
        zIndex: 1000
      });
      newMarkers.push(userMarker);
    }

    // Add driver location marker when showing route
    if (driverLocation && showRoute) {
      const driverMarker = new window.google.maps.Marker({
        position: { lat: driverLocation.latitude, lng: driverLocation.longitude },
        map: map,
        icon: {
          url: '/attached_assets/yellow-tow-truck-icon.png',
          scaledSize: new window.google.maps.Size(48, 48),
          anchor: new window.google.maps.Point(24, 24)
        },
        title: 'Your Driver - John Smith',
        zIndex: 1000
      });
      newMarkers.push(driverMarker);
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
              url: '/shared/assets/yellow-tow-truck-icon.png',
              scaledSize: new window.google.maps.Size(32, 32),
              anchor: new window.google.maps.Point(16, 16)
            },
            title: `${driver.user.name} - ${driver.vehicleType}`,
            zIndex: 500,
            optimized: false
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

  // Draw directions to destination (only once)
  useEffect(() => {
    if (!map || !userLocation || !directionsRenderer || isDriver || !destination) return;
    
    // Clear existing markers if they exist
    if (destinationMarker) {
      destinationMarker.setMap(null);
    }
    if (distanceLabel) {
      distanceLabel.setMap(null);
    }

    const userPos = { lat: userLocation.latitude, lng: userLocation.longitude };
    
    // Geocode destination address
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: destination }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const destinationPos = results[0].geometry.location;
        
        // Create destination marker
        const destMarker = new window.google.maps.Marker({
          position: destinationPos,
          map: map,
          icon: {
            path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 12,
            fillColor: '#ef4444',
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 3,
          },
          title: 'Destination',
          zIndex: 1000,
          optimized: false
        });
        setDestinationMarker(destMarker);
        
        // Calculate distance
        const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
          new window.google.maps.LatLng(userPos.lat, userPos.lng),
          destinationPos
        );
        
        const distanceText = distance >= 1000 
          ? `${(distance / 1000).toFixed(1)} km`
          : `${Math.round(distance)} m`;
        
        // Create distance label as marker
        const labelMarker = new window.google.maps.Marker({
          position: {
            lat: destinationPos.lat() + 0.001,
            lng: destinationPos.lng()
          },
          map: map,
          icon: {
            path: 'M 0,0 0,0',
            strokeOpacity: 0,
            fillOpacity: 0
          },
          label: {
            text: distanceText,
            color: '#ff7b29',
            fontWeight: 'bold',
            fontSize: '14px'
          },
          zIndex: 1001,
          optimized: false
        });
        setDistanceLabel(labelMarker);
        
        // Create directions request
        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
          {
            origin: userPos,
            destination: destinationPos,
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === 'OK' && result) {
              directionsRenderer.setDirections(result);
              setCurrentDirections(result);
            }
          }
        );
      }
    });
    
  }, [map, userLocation, destination, directionsRenderer, isDriver, destinationMarker, distanceLabel]);

  // Draw route based on phase (pickup or delivery)
  useEffect(() => {
    if (!map || !userLocation || !driverLocation || !showRoute || !directionsRenderer) return;
    
    // Update DirectionsRenderer options for orange route
    directionsRenderer.setOptions({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#f97316', // Orange color
        strokeWeight: 6,
        strokeOpacity: 0.9
      }
    });
    
    const directionsService = new window.google.maps.DirectionsService();
    
    let routeOrigin, routeDestination;
    
    if (routePhase === 'pickup') {
      // Driver to user location
      routeOrigin = { lat: driverLocation.latitude, lng: driverLocation.longitude };
      routeDestination = { lat: userLocation.latitude, lng: userLocation.longitude };
    } else {
      // User location to final destination
      if (!destination) return;
      
      // Geocode destination address
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: destination }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          const destinationPos = results[0].geometry.location;
          
          directionsService.route(
            {
              origin: { lat: userLocation.latitude, lng: userLocation.longitude },
              destination: destinationPos,
              travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
              if (status === 'OK' && result) {
                directionsRenderer.setDirections(result);
                const bounds = new window.google.maps.LatLngBounds();
                bounds.extend({ lat: userLocation.latitude, lng: userLocation.longitude });
                bounds.extend(destinationPos);
                map.fitBounds(bounds, { padding: 50 });
              }
            }
          );
        }
      });
      return;
    }
    
    directionsService.route(
      {
        origin: routeOrigin,
        destination: routeDestination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          directionsRenderer.setDirections(result);
          // Only fit bounds on first load, not on updates
          if (!map.getBounds()) {
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(routeOrigin);
            bounds.extend(routeDestination);
            map.fitBounds(bounds, { padding: 50 });
          }
        }
      }
    );
  }, [map, userLocation, driverLocation, showRoute, directionsRenderer, routePhase, destination]);

  // Handle map resize when bottom sheet changes (without re-fitting bounds)
  useEffect(() => {
    if (map) {
      setTimeout(() => {
        window.google.maps.event.trigger(map, 'resize');
      }, 300);
    }
  }, [isMinimized, map]);

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
    <div 
      ref={mapRef} 
      data-map
      className="w-full h-full relative bg-gray-200" 
      style={{ 
        pointerEvents: 'auto',
        zIndex: 1
      }}
    >
      {/* Fallback for when Google Maps fails to load */}
      <div className="absolute inset-0 flex items-center justify-center bg-gray-100" style={{ zIndex: -1 }}>
        <p className="text-gray-600">Map loading...</p>
      </div>
    </div>
  );
}
