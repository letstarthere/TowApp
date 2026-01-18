import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Navigation, MapPin, Clock } from 'lucide-react';
import { useLocation } from 'wouter';

export default function DriverInTransit() {
  const [, setLocation] = useLocation();
  const [eta, setEta] = useState('15 min');
  const [distance, setDistance] = useState('3.2 km');

  const handleArrivedAtDestination = () => {
    setLocation('/driver-destination-arrival');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-towapp-orange text-white p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">In Transit</h1>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span className="text-sm">ETA: {eta}</span>
          </div>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="flex-1 bg-gray-200 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Navigation to destination</p>
            <p className="text-sm text-gray-500">{distance} remaining</p>
          </div>
        </div>
      </div>

      {/* Destination Info */}
      <div className="bg-white p-4 shadow-sm">
        <div className="flex items-start">
          <MapPin className="w-5 h-5 text-towapp-orange mt-1 mr-3" />
          <div className="flex-1">
            <h3 className="font-medium">Destination</h3>
            <p className="text-gray-600 text-sm">123 Main Street, Johannesburg</p>
          </div>
        </div>
      </div>

      {/* Arrived Button */}
      <div className="p-4 bg-white border-t">
        <Button
          onClick={handleArrivedAtDestination}
          className="w-full h-12 bg-green-600 hover:bg-green-700"
        >
          I've Arrived at Destination
        </Button>
      </div>
    </div>
  );
}