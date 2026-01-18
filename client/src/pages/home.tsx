import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { MapPin, Clock } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import Map from "@/components/map";

export default function Home() {
  const [, setLocation] = useLocation();
  const [destination, setDestination] = useState("");
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [recentLocations, setRecentLocations] = useState<string[]>([]);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] = useState<any>(null);
  
  const { location, error: locationError } = useGeolocation();

  // Load Google Maps autocomplete
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
        script.src = `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}&libraries=places`;
        script.async = true;
        script.onload = () => initAutocomplete();
        document.head.appendChild(script);
      } catch (error) {
        console.error('Failed to load Google Maps:', error);
      }
    };
    
    const initAutocomplete = () => {
      if (window.google?.maps?.places && destinationInputRef.current && !autocomplete) {
        const autocompleteInstance = new window.google.maps.places.Autocomplete(
          destinationInputRef.current,
          {
            componentRestrictions: { country: 'za' },
            fields: ['place_id', 'geometry', 'name', 'formatted_address']
          }
        );
        
        autocompleteInstance.addListener('place_changed', () => {
          const place = autocompleteInstance.getPlace();
          if (place.formatted_address) {
            setDestination(place.formatted_address);
          }
        });
        
        setAutocomplete(autocompleteInstance);
      }
    };
    
    loadGoogleMaps();
  }, [autocomplete]);

  // Load recent locations from localStorage
  useEffect(() => {
    const recent = localStorage.getItem('recentLocations');
    if (recent) {
      setRecentLocations(JSON.parse(recent));
    }
  }, []);

  const handleServiceSelect = (service: string) => {
    setSelectedService(service);
  };

  const handleContinue = () => {
    if (!destination || !selectedService) return;
    
    // Save to localStorage
    localStorage.setItem('requestType', selectedService);
    localStorage.setItem('dropoffLocation', destination);
    localStorage.setItem('pickupLocation', 'Current Location');
    
    // Add to recent locations
    const updatedRecent = [destination, ...recentLocations.filter(loc => loc !== destination)].slice(0, 5);
    localStorage.setItem('recentLocations', JSON.stringify(updatedRecent));
    
    // Navigate to photo capture (car details)
    setLocation('/photo-capture');
  };

  const handleRecentLocationClick = (recentLocation: string) => {
    setDestination(recentLocation);
    if (destinationInputRef.current) {
      destinationInputRef.current.value = recentLocation;
    }
  };

  if (locationError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Location Access Required</h2>
          <p className="text-gray-600 mb-4">
            Please enable location access to use the app.
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Map Container - 40% of screen */}
      <div className="h-[40vh] relative">
        <Map
          center={location ? { lat: location.latitude, lng: location.longitude } : undefined}
          drivers={[]}
          userLocation={location}
          onDriverClick={() => {}}
          selectedDriver={null}
        />
      </div>
      
      {/* Bottom Section - 60% of screen */}
      <div className="h-[60vh] p-6 flex flex-col">
        {/* Header */}
        <h1 className="text-2xl font-bold text-black mb-6">Do You Need Help?</h1>
        
        {/* Service Options */}
        <div className="space-y-3 mb-6">
          <Card 
            className={`p-4 cursor-pointer border-2 transition-colors ${
              selectedService === 'flatbed' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleServiceSelect('flatbed')}
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 font-bold">FB</span>
              </div>
              <div>
                <h3 className="font-semibold text-black">Flatbed Service</h3>
                <p className="text-sm text-gray-600">Best for luxury cars and motorcycles</p>
              </div>
            </div>
          </Card>
          
          <Card 
            className={`p-4 cursor-pointer border-2 transition-colors ${
              selectedService === 'hook' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleServiceSelect('hook')}
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 font-bold">HC</span>
              </div>
              <div>
                <h3 className="font-semibold text-black">Hook & Chain Service</h3>
                <p className="text-sm text-gray-600">Standard towing for most vehicles</p>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Destination Search */}
        <div className="mb-6">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              ref={destinationInputRef}
              placeholder="Where do you need to go?"
              className="pl-10 py-3 text-base border-2 border-gray-200 focus:border-orange-500"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
        </div>
        
        {/* Recent Locations */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-3">
            <Clock className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-700">Recent Locations</h3>
          </div>
          
          {recentLocations.length > 0 ? (
            <div className="space-y-2">
              {recentLocations.map((recentLocation, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => handleRecentLocationClick(recentLocation)}
                >
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700 text-sm">{recentLocation}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent locations</p>
            </div>
          )}
        </div>
        
        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={!destination || !selectedService}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg mt-4 disabled:bg-gray-300"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}