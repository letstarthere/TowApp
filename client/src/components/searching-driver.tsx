import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, MapPin, Clock } from "lucide-react";

interface SearchingDriverProps {
  pickupLocation: string;
  dropoffLocation?: string;
  serviceType: string;
  estimatedPrice: number;
}

export default function SearchingDriver({ 
  pickupLocation, 
  dropoffLocation, 
  serviceType, 
  estimatedPrice 
}: SearchingDriverProps) {
  const [dots, setDots] = useState("");
  const [searchTime, setSearchTime] = useState(0);

  useEffect(() => {
    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);

    // Count search time
    const timeInterval = setInterval(() => {
      setSearchTime(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-[40vh] bg-white p-6 flex flex-col justify-center">
      <div className="text-center mb-8">
        {/* Animated truck icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Truck className="w-10 h-10 text-orange-500" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full animate-ping"></div>
        </div>

        {/* Main message */}
        <h2 className="text-2xl font-bold text-black mb-2">
          Searching for a driver{dots}
        </h2>
        <p className="text-gray-600 mb-4">
          We're finding the best driver for your request
        </p>

        {/* Search time */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-500">
            Searching for {formatTime(searchTime)}
          </span>
        </div>
      </div>

      {/* Request details */}
      <Card className="bg-gray-50 border-0">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-green-600 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-800">Pickup</p>
                <p className="text-sm text-gray-600">{pickupLocation}</p>
              </div>
            </div>
            
            {dropoffLocation && (
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-red-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Destination</p>
                  <p className="text-sm text-gray-600">{dropoffLocation}</p>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-800">Service</p>
                <p className="text-sm text-gray-600">{serviceType}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">Estimated Fee</p>
                <p className="text-lg font-bold text-orange-500">R{estimatedPrice}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress indicators */}
      <div className="flex justify-center space-x-2 mt-6">
        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
}