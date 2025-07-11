import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { User, History, Navigation, Star, Truck } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import Map from "@/components/map";
import RequestModal from "@/components/request-modal";
import TowTruckCard from "@/components/tow-truck-card";
import type { DriverWithUser } from "@/lib/types";

export default function UserMap() {
  const [, setLocation] = useLocation();
  const [pickupLocation, setPickupLocation] = useState("Current Location");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<DriverWithUser | null>(null);
  
  const { user } = useAuth();
  const { location, error: locationError } = useGeolocation();
  const { toast } = useToast();
  
  // WebSocket connection
  useWebSocket(user?.id || 0, (message) => {
    if (message.type === 'request_accepted') {
      toast({
        title: "Request Accepted!",
        description: `${message.request.driver?.user.name} is on the way`,
      });
    }
  });

  // Fetch nearby drivers
  const { data: nearbyDrivers, isLoading: driversLoading } = useQuery({
    queryKey: ['/api/drivers/nearby', location?.latitude, location?.longitude],
    enabled: !!location,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Create request mutation
  const createRequestMutation = useMutation({
    mutationFn: async (requestData: any) => {
      return apiRequest("POST", "/api/requests", requestData);
    },
    onSuccess: () => {
      toast({
        title: "Request Sent!",
        description: "Your tow request has been sent to nearby drivers",
      });
      setShowRequestModal(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDriverSelect = (driver: DriverWithUser) => {
    setSelectedDriver(driver);
    setShowRequestModal(true);
  };

  const handleRequestConfirm = () => {
    if (!location || !selectedDriver) return;

    const requestData = {
      pickupLatitude: location.latitude,
      pickupLongitude: location.longitude,
      pickupAddress: pickupLocation,
      estimatedPrice: 350, // Calculate based on distance
    };

    if (dropoffLocation) {
      // In a real app, you'd geocode the dropoff address
      requestData.dropoffAddress = dropoffLocation;
    }

    createRequestMutation.mutate(requestData);
  };

  const handleProfileClick = () => {
    setLocation("/profile");
  };

  if (locationError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Location Access Required</h2>
            <p className="text-gray-600 mb-4">
              Please enable location access to find nearby tow trucks.
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-towapp-orange hover:bg-orange-600"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Map Container */}
      <div className="h-screen relative">
        <Map
          center={location ? { lat: location.latitude, lng: location.longitude } : undefined}
          drivers={nearbyDrivers || []}
          userLocation={location}
          onDriverClick={handleDriverSelect}
        />
        
        {/* Top Navigation */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-white bg-opacity-95 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleProfileClick}
            className="w-10 h-10 rounded-full bg-white shadow-lg hover:bg-gray-50"
          >
            <User className="w-5 h-5 text-gray-600" />
          </Button>
          <h1 className="text-lg font-semibold text-towapp-black">Find Tow Truck</h1>
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-full bg-white shadow-lg hover:bg-gray-50"
          >
            <History className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
        
        {/* Location Button */}
        <div className="absolute top-20 right-4">
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 bg-white rounded-full shadow-lg hover:bg-gray-50"
            onClick={() => window.location.reload()}
          >
            <Navigation className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
        
        {/* Bottom Card */}
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 shadow-2xl">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
          
          <div className="space-y-4">
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
                value={dropoffLocation}
                onChange={(e) => setDropoffLocation(e.target.value)}
                className="flex-1 bg-gray-100 px-4 py-3 rounded-xl border-0"
                placeholder="Drop-off location (optional)"
              />
            </div>
            
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <h3 className="font-semibold text-towapp-black mb-2">Available Tow Trucks</h3>
                
                {driversLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-towapp-orange"></div>
                  </div>
                ) : nearbyDrivers?.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">No tow trucks available nearby</p>
                ) : (
                  <div className="space-y-3">
                    {nearbyDrivers?.map((driver) => (
                      <TowTruckCard
                        key={driver.id}
                        driver={driver}
                        onSelect={() => handleDriverSelect(driver)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Button
              onClick={() => nearbyDrivers?.[0] && handleDriverSelect(nearbyDrivers[0])}
              disabled={!nearbyDrivers?.length || createRequestMutation.isPending}
              className="w-full bg-towapp-orange hover:bg-orange-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg disabled:opacity-50"
            >
              {createRequestMutation.isPending ? "Sending Request..." : "Request Tow Truck"}
            </Button>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && selectedDriver && (
        <RequestModal
          driver={selectedDriver}
          onConfirm={handleRequestConfirm}
          onCancel={() => setShowRequestModal(false)}
          isLoading={createRequestMutation.isPending}
        />
      )}
    </div>
  );
}
