import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { User, Bell, Truck, CheckCircle, XCircle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import Map from "@/components/map";
import type { RequestWithDetails } from "@/lib/types";

export default function DriverMap() {
  const [, setLocation] = useLocation();
  const [isAvailable, setIsAvailable] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<RequestWithDetails | null>(null);
  
  const { user } = useAuth();
  const { location } = useGeolocation();
  const { toast } = useToast();
  
  // WebSocket connection
  useWebSocket(user?.id || 0, (message) => {
    if (message.type === 'new_request') {
      setPendingRequest(message.request);
      toast({
        title: "New Tow Request!",
        description: `Request from ${message.request.pickupAddress}`,
      });
    }
  });

  // Update location periodically
  useEffect(() => {
    if (location && user?.driver) {
      const interval = setInterval(() => {
        apiRequest("PUT", "/api/drivers/location", {
          latitude: location.latitude,
          longitude: location.longitude,
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [location, user?.driver]);

  // Get driver requests
  const { data: requests } = useQuery({
    queryKey: ['/api/requests/my'],
    refetchInterval: 10000,
  });

  // Update availability mutation
  const updateAvailabilityMutation = useMutation({
    mutationFn: async (available: boolean) => {
      return apiRequest("PUT", "/api/drivers/availability", { isAvailable: available });
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: `You are now ${isAvailable ? 'available' : 'unavailable'} for requests`,
      });
    },
  });

  // Accept request mutation
  const acceptRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      return apiRequest("PUT", `/api/requests/${requestId}/accept`);
    },
    onSuccess: () => {
      setPendingRequest(null);
      toast({
        title: "Request Accepted",
        description: "Navigate to the pickup location",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/requests/my'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Decline request
  const handleDeclineRequest = () => {
    setPendingRequest(null);
    toast({
      title: "Request Declined",
      description: "Looking for other available drivers",
    });
  };

  const handleToggleAvailability = () => {
    const newStatus = !isAvailable;
    setIsAvailable(newStatus);
    updateAvailabilityMutation.mutate(newStatus);
  };

  const handleProfileClick = () => {
    setLocation("/profile");
  };

  const completedToday = requests?.filter(r => 
    r.status === 'completed' && 
    new Date(r.createdAt).toDateString() === new Date().toDateString()
  ).length || 0;

  const earningsToday = requests?.filter(r => 
    r.status === 'completed' && 
    new Date(r.createdAt).toDateString() === new Date().toDateString()
  ).reduce((sum, r) => sum + (parseFloat(r.actualPrice || r.estimatedPrice) || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-white relative">
      {/* Map Container */}
      <div className="h-screen relative">
        <Map
          center={location ? { lat: location.latitude, lng: location.longitude } : undefined}
          drivers={[]}
          userLocation={location}
          isDriver={true}
          requests={requests?.filter(r => r.status === 'pending') || []}
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
          <div className="text-center">
            <h1 className="text-lg font-semibold text-towapp-black">Driver Dashboard</h1>
            <div className="flex items-center justify-center space-x-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`text-sm font-medium ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                {isAvailable ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-full bg-white shadow-lg hover:bg-gray-50"
          >
            <Bell className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
        
        {/* Status Toggle */}
        <div className="absolute top-20 right-4">
          <Button
            onClick={handleToggleAvailability}
            disabled={updateAvailabilityMutation.isPending}
            className={`px-4 py-2 rounded-full shadow-lg font-medium text-sm ${
              isAvailable 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {isAvailable ? 'Available' : 'Unavailable'}
          </Button>
        </div>
        
        {/* Bottom Card */}
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 shadow-2xl">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-towapp-black">Today's Stats</h3>
              <span className="text-sm text-gray-600">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-gray-50">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-towapp-black">{completedToday}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-50">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-towapp-black">R{earningsToday}</p>
                  <p className="text-sm text-gray-600">Earnings</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-50">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-towapp-black">4.9</p>
                  <p className="text-sm text-gray-600">Rating</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Pending Request */}
            {pendingRequest && (
              <Card className="bg-red-50 border border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <h4 className="font-semibold text-red-800">New Request</h4>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-red-700">
                      <strong>Pickup:</strong> {pendingRequest.pickupAddress}
                    </p>
                    <p className="text-sm text-red-700">
                      <strong>Customer:</strong> {pendingRequest.user.name}
                    </p>
                    <p className="text-sm text-red-700">
                      <strong>Fee:</strong> R{pendingRequest.estimatedPrice}
                    </p>
                  </div>
                  <div className="flex space-x-3 mt-4">
                    <Button
                      onClick={handleDeclineRequest}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Decline
                    </Button>
                    <Button
                      onClick={() => acceptRequestMutation.mutate(pendingRequest.id)}
                      disabled={acceptRequestMutation.isPending}
                      size="sm"
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Accept
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
