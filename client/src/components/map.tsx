import { useEffect, useRef } from "react";
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

export default function Map({ 
  center, 
  drivers, 
  userLocation, 
  isDriver = false, 
  requests = [],
  onDriverClick 
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  // This is a simplified map component
  // In a real app, you'd integrate with Google Maps API
  
  return (
    <div ref={mapRef} className="w-full h-full relative bg-gray-200">
      {/* Simulated map background */}
      <div 
        className="w-full h-full bg-cover bg-center relative"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=800')`
        }}
      >
        <div className={`absolute inset-0 ${isDriver ? 'bg-green-50' : 'bg-blue-50'} bg-opacity-20`}></div>
        
        {/* User location */}
        {userLocation && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {isDriver ? (
              <div className="relative">
                <div className="w-6 h-6 bg-towapp-orange rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                  <Truck className="w-3 h-3 text-white" />
                </div>
                <div className="w-12 h-12 bg-orange-200 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
              </div>
            ) : (
              <div className="relative">
                <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                <div className="w-8 h-8 bg-blue-200 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
              </div>
            )}
          </div>
        )}
        
        {/* Driver markers */}
        {!isDriver && drivers.map((driver, index) => (
          <div
            key={driver.id}
            className={`absolute cursor-pointer ${
              index === 0 ? 'top-1/3 left-1/4' : 
              index === 1 ? 'top-2/3 right-1/3' : 
              'bottom-1/4 left-1/2'
            } transform -translate-x-1/2 -translate-y-1/2`}
            onClick={() => onDriverClick?.(driver)}
          >
            <div className="w-8 h-8 bg-towapp-orange rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform">
              <Truck className="w-4 h-4" />
            </div>
          </div>
        ))}
        
        {/* Request markers for drivers */}
        {isDriver && requests.map((request, index) => (
          <div
            key={request.id}
            className={`absolute ${
              index === 0 ? 'top-1/4 left-1/3' : 'bottom-1/3 right-1/4'
            } transform -translate-x-1/2 -translate-y-1/2`}
          >
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Map controls overlay */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-600 bg-white bg-opacity-75 px-2 py-1 rounded">
        Simulated Map View
      </div>
    </div>
  );
}
