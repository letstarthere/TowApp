import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Clock, Zap } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";

type RequestType = 'REQUEST_NOW' | 'SCHEDULE_PICKUP';

export default function ServiceSelection() {
  const [, setLocation] = useLocation();
  const [requestType, setRequestType] = useState<RequestType | null>(null);
  const [pickupLocation, setPickupLocation] = useState("Current Location");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const dropoffInputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] = useState<any>(null);
  const { location } = useGeolocation();

  const requestTypes = [
    {
      type: 'REQUEST_NOW' as RequestType,
      label: 'Request Now',
      icon: Zap,
      description: 'Get immediate towing service'
    },
    {
      type: 'SCHEDULE_PICKUP' as RequestType,
      label: 'Schedule a Pickup',
      icon: Clock,
      description: 'Schedule for later'
    }
  ];

  const handleRequestTypeSelect = (type: RequestType) => {
    setRequestType(type);
  };

  const handleContinue = () => {
    if (!requestType) return;
    
    localStorage.setItem('requestType', requestType);
    localStorage.setItem('pickupLocation', pickupLocation);
    localStorage.setItem('dropoffLocation', dropoffLocation);
    
    if (requestType === 'REQUEST_NOW') {
      setLocation('/photo-capture');
    } else {
      setLocation('/user-map');
    }
  };

  // Load Google Maps and initialize autocomplete
  useEffect(() => {
    const loadGoogleMaps = async () => {
      if (window.google?.maps?.places) {
        initAutocomplete();
        return;
      }
      
      try {
        const response = await fetch('/api/config/maps');
        const config = await response.json();
        
        if (!config.apiKey) return;
        
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}&libraries=places,geometry`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          setTimeout(initAutocomplete, 100);
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('Failed to load Google Maps:', error);
      }
    };
    
    const initAutocomplete = () => {
      if (window.google?.maps?.places && dropoffInputRef.current && !autocomplete) {
        const autocompleteInstance = new window.google.maps.places.Autocomplete(
          dropoffInputRef.current,
          {
            componentRestrictions: { country: 'za' },
            fields: ['place_id', 'geometry', 'name', 'formatted_address']
          }
        );
        
        autocompleteInstance.addListener('place_changed', () => {
          const place = autocompleteInstance.getPlace();
          if (place.formatted_address) {
            setDropoffLocation(place.formatted_address);
          }
        });
        
        setAutocomplete(autocompleteInstance);
      }
    };
    
    loadGoogleMaps();
  }, [autocomplete]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="text-center pt-16 pb-8">
        <h1 className="text-3xl font-bold text-towapp-black mb-2">
          How would you like to proceed?
        </h1>
      </div>

      <div className="px-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mx-auto">
          {requestTypes.map((request) => {
            const IconComponent = request.icon;
            const isSelected = requestType === request.type;
            
            return (
              <Card
                key={request.type}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isSelected ? 'border-2 border-towapp-orange' : 'border border-gray-200'
                }`}
                onClick={() => handleRequestTypeSelect(request.type)}
              >
                <CardContent className="p-8 text-center">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-towapp-orange text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <IconComponent className="w-10 h-10" />
                  </div>
                  <h3 className="font-bold text-xl text-towapp-black mb-3">
                    {request.label}
                  </h3>
                  <p className="text-gray-600">
                    {request.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 px-6 mb-8">
        <h3 className="font-semibold text-lg text-towapp-black">Location Details</h3>
        
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <Input
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            className="flex-1 bg-gray-100 px-4 py-3 rounded-xl border-0"
            placeholder="Your location"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <Input
            ref={dropoffInputRef}
            value={dropoffLocation}
            onChange={(e) => setDropoffLocation(e.target.value)}
            className="flex-1 bg-gray-100 px-4 py-3 rounded-xl border-0"
            placeholder="Drop-off location (optional)"
          />
        </div>
      </div>

      <div className="p-6 mt-auto">
        <Button
          onClick={handleContinue}
          disabled={!requestType}
          className="w-full bg-towapp-orange hover:bg-orange-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg disabled:opacity-50"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}