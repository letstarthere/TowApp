import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, MapPin, Clock, Phone, Star } from "lucide-react";
import driverProfileImage from "../../../attached_assets/driver_profile_image.png";
import towTruckImage from "../../../attached_assets/white-long-flatbed-tow-truck.svg";

interface DriverOnWayProps {
  driver: {
    id: number;
    name: string;
    vehicleType: string;
    licensePlate: string;
    rating: number;
    phone: string;
    currentLatitude: number;
    currentLongitude: number;
  };
  userLocation: {
    latitude: number;
    longitude: number;
  };
  estimatedArrival?: string;
}

interface DriverOnWayProps {
  driver: {
    id: number;
    name: string;
    vehicleType: string;
    licensePlate: string;
    rating: number;
    phone: string;
    currentLatitude: number;
    currentLongitude: number;
  };
  userLocation: {
    latitude: number;
    longitude: number;
  };
  estimatedArrival?: string;
  hasArrived?: boolean;
}

export default function DriverOnWay({ driver, userLocation, estimatedArrival = "8-12 min", hasArrived = false }: DriverOnWayProps) {
  const [distance, setDistance] = useState<string>("");

  useEffect(() => {
    // Play success notification sound with multiple attempts
    const playSound = () => {
      const audio = new Audio('/attached_assets/TowApp_Success_Notification_Sound.mp3');
      audio.volume = 0.8;
      audio.preload = 'auto';
      
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Success sound played successfully');
          })
          .catch(error => {
            console.log('Autoplay prevented:', error);
            
            // Play on next user interaction
            const playOnClick = () => {
              audio.play().then(() => {
                console.log('Sound played after click');
              }).catch(e => console.log('Still failed:', e));
            };
            
            document.addEventListener('click', playOnClick, { once: true });
            document.addEventListener('touchstart', playOnClick, { once: true });
          });
      }
    };
    
    playSound();
    setTimeout(playSound, 500);

    // Calculate distance using Google Maps Distance Matrix API
    if (window.google?.maps) {
      const service = new window.google.maps.DistanceMatrixService();
      service.getDistanceMatrix({
        origins: [{ lat: driver.currentLatitude, lng: driver.currentLongitude }],
        destinations: [{ lat: userLocation.latitude, lng: userLocation.longitude }],
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
      }, (response, status) => {
        if (status === 'OK' && response?.rows[0]?.elements[0]?.status === 'OK') {
          const element = response.rows[0].elements[0];
          setDistance(element.distance?.text || "");
        }
      });
    }
  }, [driver, userLocation]);

  return (
    <div className="bg-white p-4 flex flex-col h-full">
      {/* Status message at top */}
      <h2 className="text-3xl font-bold text-center mb-2 text-black">
        {hasArrived ? 'Your driver has arrived' : `Sean is arriving in 1m`}
      </h2>
      
      {hasArrived && (
        <p className="text-center text-gray-600 mb-4">Sean is ready to tow the car</p>
      )}
      
      {/* Driver and truck layout */}
      <div className="flex items-start space-x-6 mb-4">
        {/* Driver profile image */}
        <div className="flex flex-col items-center">
          <img 
            src={driverProfileImage} 
            alt="Driver Profile" 
            className="w-16 h-16 rounded-full object-cover mb-1"
          />
          <div className="flex items-center justify-center px-2 py-1 bg-white border border-black rounded-full">
            <Star className="w-3 h-3 text-orange-500 fill-current mr-1" />
            <span className="text-xs text-black font-medium">{driver.rating}</span>
          </div>
        </div>
        
        {/* Vehicle and driver info */}
        <div className="flex-1">
          <p className="text-lg font-bold text-black mb-0.5">Flatbed Truck</p>
          <p className="text-sm font-bold text-gray-500 mb-0.5">Mercedes Actros</p>
          <p className="text-sm font-medium text-gray-800 mb-0.5">RMZ 154 GP</p>
          <p className="text-sm text-gray-600">{driver.name}</p>
        </div>
        
        {/* Truck image */}
        <div>
          <img 
            src={towTruckImage} 
            alt="Tow Truck" 
            className="w-32 h-20 object-contain"
          />
        </div>
      </div>
      
      {hasArrived && (
        <>
          <div className="w-full h-px bg-gray-300 mb-4"></div>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Destination</p>
            <p className="text-gray-900 font-medium">Sandton City Mall, Johannesburg</p>
          </div>
        </>
      )}
      
      {/* Action buttons */}
      <div className="flex space-x-3">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50 bg-orange-50"
          onClick={() => {
            window.open(`tel:${driver.phone}`, '_self');
          }}
        >
          <Phone className="w-4 h-4 mr-1" />
          Call Driver
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50 bg-orange-50"
        >
          <MessageCircle className="w-4 h-4 mr-1" />
          Chat
        </Button>
      </div>
    </div>
  );
}