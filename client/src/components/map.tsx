import { useEffect, useRef, useState } from "react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { DriverWithUser, RequestWithDetails } from "@/lib/types";

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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const pulseElementRef = useRef<HTMLDivElement | null>(null);
  const destinationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const distanceLabelRef = useRef<mapboxgl.Marker | null>(null);

  // Initialize Mapbox
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const defaultCenter = center || 
      (userLocation ? [userLocation.longitude, userLocation.latitude] : 
      [28.0473, -26.2041]); // Johannesburg default

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: defaultCenter as [number, number],
      zoom: 13,
      attributionControl: false
    });
    
    mapRef.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);



  // Update markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
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
        pulseElementRef.current = pulse;
        
        userMarkerRef.current = new mapboxgl.Marker({ element: el })
          .setLngLat([userLocation.longitude, userLocation.latitude])
          .addTo(mapRef.current);
      } else {
        userMarkerRef.current.setLngLat([userLocation.longitude, userLocation.latitude]);
      }
    }

    // Driver location marker
    if (driverLocation && showRoute) {
      const el = document.createElement('div');
      el.style.cssText = 'width:48px;height:48px;background-image:url(/attached_assets/yellow-tow-truck-icon.png);background-size:cover';
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([driverLocation.longitude, driverLocation.latitude])
        .addTo(mapRef.current);
      markersRef.current.push(marker);
    }

    // Driver markers for users
    if (!isDriver) {
      drivers.forEach(driver => {
        if (driver.currentLatitude && driver.currentLongitude) {
          const el = document.createElement('div');
          el.style.cssText = 'width:32px;height:32px;background-image:url(/shared/assets/yellow-tow-truck-icon.png);background-size:cover;cursor:pointer';
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

  // Draw route to destination
  useEffect(() => {
    if (!mapRef.current || !userLocation || isDriver || !destination) return;

    const getRoute = async () => {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destination)}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      if (data.features?.[0]) {
        const destCoords = data.features[0].center;
        
        // Add destination marker
        if (destinationMarkerRef.current) {
          destinationMarkerRef.current.remove();
        }
        const destEl = document.createElement('div');
        destEl.style.cssText = 'width:0;height:0;border-left:12px solid transparent;border-right:12px solid transparent;border-top:24px solid #ef4444;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))';
        destinationMarkerRef.current = new mapboxgl.Marker({ element: destEl, anchor: 'bottom' })
          .setLngLat(destCoords as [number, number])
          .addTo(mapRef.current!);
        
        // Calculate distance
        const distance = mapRef.current!.getSource('route') ? 0 : 
          Math.sqrt(
            Math.pow((destCoords[0] - userLocation.longitude) * 111320 * Math.cos(userLocation.latitude * Math.PI / 180), 2) +
            Math.pow((destCoords[1] - userLocation.latitude) * 110540, 2)
          );
        
        const routeResponse = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${userLocation.longitude},${userLocation.latitude};${destCoords[0]},${destCoords[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
        );
        const routeData = await routeResponse.json();
        if (routeData.routes?.[0]) {
          const route = routeData.routes[0].geometry;
          const distanceKm = routeData.routes[0].distance / 1000;
          const distanceText = distanceKm >= 1 ? `${distanceKm.toFixed(1)} km` : `${Math.round(routeData.routes[0].distance)} m`;
          
          // Add distance label
          if (distanceLabelRef.current) {
            distanceLabelRef.current.remove();
          }
          const labelEl = document.createElement('div');
          labelEl.style.cssText = 'background:#ff7b29;color:white;padding:4px 8px;border-radius:4px;font-weight:bold;font-size:14px;box-shadow:0 2px 4px rgba(0,0,0,0.2)';
          labelEl.textContent = distanceText;
          distanceLabelRef.current = new mapboxgl.Marker({ element: labelEl, anchor: 'bottom' })
            .setLngLat([destCoords[0], destCoords[1] + 0.001] as [number, number])
            .addTo(mapRef.current!);
          
          if (mapRef.current!.getSource('route')) {
            (mapRef.current!.getSource('route') as mapboxgl.GeoJSONSource).setData(route);
          } else {
            mapRef.current!.addSource('route', { type: 'geojson', data: route });
            mapRef.current!.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              paint: { 'line-color': '#f97316', 'line-width': 6, 'line-opacity': 0.9 }
            });
          }
        }
      }
    };
    getRoute();
  }, [userLocation, destination, isDriver]);

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
