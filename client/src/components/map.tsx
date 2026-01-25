import { useEffect, useRef } from "react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { DriverWithUser, RequestWithDetails } from "@/lib/types";
import yellowTowTruckIcon from "../../../attached_assets/yellow-tow-truck-icon.png";

mapboxgl.accessToken = 'pk.eyJ1Ijoic2VhbmJhbXBvZS0xMjMiLCJhIjoiY21rbnkzNWZ3MDBrYjNscW4yNGJsbHBxYiJ9.BJHCl5yY8vUv_1lwOgMjuA';

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
  drawRoute?: boolean;
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
  routePhase = 'pickup',
  drawRoute = false
}: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const destinationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const demoTrucksRef = useRef<{ marker: mapboxgl.Marker; position: [number, number]; direction: number }[]>([]);
  const routeDrawnRef = useRef(false);

  // Initialize Mapbox
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const defaultCenter = userLocation ? [userLocation.longitude, userLocation.latitude] : [28.0473, -26.2041];

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: defaultCenter as [number, number],
      zoom: 15,
      attributionControl: false,
      scrollZoom: false,
      touchZoomRotate: false,
      doubleClickZoom: false
    });
    
    mapRef.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    return () => {
      demoTrucksRef.current.forEach(t => t.marker.remove());
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [userLocation]);

  // Center on user location
  useEffect(() => {
    if (mapRef.current && userLocation) {
      mapRef.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 15,
        duration: 1000
      });
    }
  }, [userLocation]);

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // User location marker with pulse
    if (userLocation) {
      if (!userMarkerRef.current) {
        const el = document.createElement('div');
        el.className = 'user-marker';
        el.style.cssText = 'width:16px;height:16px;background:#f97316;border:3px solid white;border-radius:50%;box-shadow:0 0 10px rgba(249,115,22,0.5)';
        
        const pulse = document.createElement('div');
        pulse.style.cssText = 'position:absolute;width:50px;height:50px;background:rgba(249,115,22,0.2);border:2px solid rgba(249,115,22,0.8);border-radius:50%;top:50%;left:50%;transform:translate(-50%,-50%);animation:pulse 2s infinite';
        el.appendChild(pulse);
        
        userMarkerRef.current = new mapboxgl.Marker({ element: el })
          .setLngLat([userLocation.longitude, userLocation.latitude])
          .addTo(mapRef.current);
      } else {
        userMarkerRef.current.setLngLat([userLocation.longitude, userLocation.latitude]);
      }
    }

    // Driver location marker
    if (driverLocation && showRoute) {
      const el = document.createElement('img');
      el.src = yellowTowTruckIcon;
      el.style.cssText = 'width:48px;height:48px;object-fit:contain';
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([driverLocation.longitude, driverLocation.latitude])
        .addTo(mapRef.current);
      markersRef.current.push(marker);
    }

    // Driver markers for users
    if (!isDriver) {
      drivers.forEach(driver => {
        if (driver.currentLatitude && driver.currentLongitude) {
          const el = document.createElement('img');
          el.src = yellowTowTruckIcon;
          el.style.cssText = 'width:32px;height:32px;object-fit:contain;cursor:pointer';
          el.onclick = () => onDriverClick?.(driver);
          const marker = new mapboxgl.Marker({ element: el })
            .setLngLat([parseFloat(driver.currentLongitude.toString()), parseFloat(driver.currentLatitude.toString())])
            .addTo(mapRef.current!);
          markersRef.current.push(marker);
        }
      });
    }

    // Request markers for drivers
    if (isDriver) {
      requests.forEach(request => {
        const el = document.createElement('div');
        el.style.cssText = 'width:24px;height:24px;background:#ef4444;border:2px solid white;border-radius:50%;animation:bounce 1s infinite';
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([parseFloat(request.pickupLongitude.toString()), parseFloat(request.pickupLatitude.toString())])
          .addTo(mapRef.current!);
        markersRef.current.push(marker);
      });
    }
  }, [drivers, userLocation, isDriver, requests, onDriverClick, driverLocation, showRoute]);

  // Demo moving tow trucks
  useEffect(() => {
    if (!mapRef.current || !userLocation || isDriver) return;

    if (demoTrucksRef.current.length === 0) {
      const truckPositions: [number, number][] = [
        [userLocation.longitude + 0.002, userLocation.latitude + 0.002],
        [userLocation.longitude - 0.002, userLocation.latitude - 0.002],
        [userLocation.longitude + 0.003, userLocation.latitude - 0.001],
        [userLocation.longitude - 0.001, userLocation.latitude + 0.003],
        [userLocation.longitude + 0.0015, userLocation.latitude + 0.0015],
        [userLocation.longitude - 0.0025, userLocation.latitude + 0.001]
      ];

      truckPositions.forEach((pos) => {
        const el = document.createElement('img');
        el.src = yellowTowTruckIcon;
        el.style.cssText = 'width:40px;height:40px;object-fit:contain;transition:all 0.5s linear';
        const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat(pos)
          .addTo(mapRef.current!);
        demoTrucksRef.current.push({ marker, position: pos, direction: Math.random() * 360 });
      });
    }

    const interval = setInterval(() => {
      demoTrucksRef.current.forEach(truck => {
        const speed = 0.00005;
        truck.direction += (Math.random() - 0.5) * 30;
        const rad = (truck.direction * Math.PI) / 180;
        truck.position[0] += Math.cos(rad) * speed;
        truck.position[1] += Math.sin(rad) * speed;
        truck.marker.setLngLat(truck.position);
        (truck.marker.getElement() as HTMLElement).style.transform = `rotate(${truck.direction}deg)`;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [userLocation, isDriver]);

  // Draw route to destination with geocoding
  useEffect(() => {
    if (!mapRef.current || !userLocation || isDriver || !destination || !drawRoute) return;

    const getRoute = async () => {
      try {
        const geoResponse = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destination)}.json?access_token=${mapboxgl.accessToken}&limit=1`
        );
        const geoData = await geoResponse.json();
        if (!geoData.features?.[0]) return;
        
        const destCoords = geoData.features[0].center;
        
        if (destinationMarkerRef.current) destinationMarkerRef.current.remove();
        const destEl = document.createElement('div');
        destEl.style.cssText = 'width:30px;height:30px;background:#ef4444;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)';
        destinationMarkerRef.current = new mapboxgl.Marker({ element: destEl, anchor: 'bottom' })
          .setLngLat(destCoords as [number, number])
          .addTo(mapRef.current!);
        
        const routeResponse = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${userLocation.longitude},${userLocation.latitude};${destCoords[0]},${destCoords[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
        );
        const routeData = await routeResponse.json();
        if (routeData.routes?.[0]) {
          const route = routeData.routes[0].geometry;
          
          if (mapRef.current!.getSource('route')) {
            (mapRef.current!.getSource('route') as mapboxgl.GeoJSONSource).setData(route);
          } else {
            mapRef.current!.addSource('route', { type: 'geojson', data: route });
            mapRef.current!.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              paint: { 'line-color': '#f97316', 'line-width': 6, 'line-opacity': 0.9 },
              layout: { 'line-join': 'round', 'line-cap': 'round' }
            });
          }
          
          const bounds = new mapboxgl.LngLatBounds();
          bounds.extend([userLocation.longitude, userLocation.latitude]);
          bounds.extend(destCoords as [number, number]);
          mapRef.current!.fitBounds(bounds, { padding: 80, duration: 1500 });
        }
      } catch (error) {
        console.error('Route error:', error);
      }
    };
    getRoute();
  }, [drawRoute, isDriver]);

  // Draw route based on phase
  useEffect(() => {
    if (!mapRef.current || !userLocation || !driverLocation || !showRoute) return;

    const getRoute = async () => {
      let start, end;
      if (routePhase === 'pickup') {
        start = [driverLocation.longitude, driverLocation.latitude];
        end = [userLocation.longitude, userLocation.latitude];
      } else {
        if (!destination) return;
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destination)}.json?access_token=${mapboxgl.accessToken}`
        );
        const data = await response.json();
        if (!data.features?.[0]) return;
        start = [userLocation.longitude, userLocation.latitude];
        end = data.features[0].center;
      }
      
      const routeResponse = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
      );
      const routeData = await routeResponse.json();
      if (routeData.routes?.[0]) {
        const route = routeData.routes[0].geometry;
        if (mapRef.current!.getSource('active-route')) {
          (mapRef.current!.getSource('active-route') as mapboxgl.GeoJSONSource).setData(route);
        } else {
          mapRef.current!.addSource('active-route', { type: 'geojson', data: route });
          mapRef.current!.addLayer({
            id: 'active-route',
            type: 'line',
            source: 'active-route',
            paint: { 'line-color': '#f97316', 'line-width': 6 }
          });
        }
      }
    };
    getRoute();
  }, [userLocation, driverLocation, showRoute, routePhase, destination]);

  // Handle map resize
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => mapRef.current?.resize(), 300);
    }
  }, [isMinimized]);

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          50% { transform: translate(-50%, -50%) scale(2); opacity: 0.2; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
      <div ref={mapContainerRef} className="w-full h-full" />
    </>
  );
}
