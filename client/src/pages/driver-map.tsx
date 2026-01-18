import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import Map from "@/components/map";
import DriverNotification from "@/components/driver-notification";
import TopStatusBar from "@/components/driver/top-status-bar";
import DriverMenu from "@/components/driver/driver-menu";
import FloatingMapActions from "@/components/driver/floating-map-actions";
import PerformanceCards from "@/components/driver/performance-cards";
import BottomNavigation from "@/components/driver/bottom-navigation";
import DriverVerificationModal from "@/components/DriverVerificationModal";
import type { RequestWithDetails } from "@/lib/types";

export default function DriverMap() {
  const [, setLocation] = useLocation();
  const [isAvailable, setIsAvailable] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<RequestWithDetails | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [driverStatus, setDriverStatus] = useState<'active' | 'pending_verification' | 'suspended'>('pending_verification');
  
  const { user } = useAuth();
  const { location } = useGeolocation();
  const { toast } = useToast();
  
  // Check driver verification status
  useEffect(() => {
    const checkVerificationStatus = () => {
      const status = localStorage.getItem('driver_verification_status') || 'pending_verification';
      setDriverStatus(status as any);
    };
    
    checkVerificationStatus();
    
    // Check for status updates every 5 seconds
    const interval = setInterval(checkVerificationStatus, 5000);
    return () => clearInterval(interval);
  }, []);
  
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

  // Update driver location periodically
  useEffect(() => {
    if (user?.driver && location) {
      const interval = setInterval(() => {
        apiRequest("PUT", "/api/drivers/location", {
          latitude: location.latitude,
          longitude: location.longitude
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [user?.driver, location]);

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

  const handleRecenterMap = () => {
    // Map recenter logic would go here
    console.log('Recenter map to driver location');
  };

  const handleFilterClick = () => {
    console.log('Open filter modal');
  };

  const handleBreakMode = () => {
    setIsOnBreak(!isOnBreak);
    toast({
      title: isOnBreak ? "Break Ended" : "Break Started",
      description: isOnBreak ? "You're back online" : "You're now on break",
    });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== 'home') {
      // Navigate to other pages when implemented
      console.log(`Navigate to ${tab}`);
    }
  };

  const completedToday = requests?.filter(r => 
    r.status === 'completed' && 
    new Date(r.createdAt).toDateString() === new Date().toDateString()
  ).length || 0;

  const earningsToday = requests?.filter(r => 
    r.status === 'completed' && 
    new Date(r.createdAt).toDateString() === new Date().toDateString()
  ).reduce((sum, r) => sum + (parseFloat(r.actualPrice || r.estimatedPrice) || 0), 0) || 0;

  const isVerificationPending = driverStatus === 'pending_verification';

  return (
    <div className="min-h-screen bg-white relative">
      {/* Map Container */}
      <div className={`h-screen relative ${isVerificationPending ? 'blur-sm pointer-events-none' : ''}`}>
        <Map
          center={location ? { lat: location.latitude, lng: location.longitude } : undefined}
          drivers={[]}
          userLocation={location}
          isDriver={true}
          requests={requests?.filter(r => r.status === 'pending') || []}
        />
        
        {/* Top Status Bar */}
        <TopStatusBar
          isAvailable={isAvailable}
          onToggleAvailability={handleToggleAvailability}
          onMenuClick={() => setIsMenuOpen(true)}
          isLoading={updateAvailabilityMutation.isPending}
        />
        
        {/* Floating Map Actions */}
        <FloatingMapActions
          onRecenter={handleRecenterMap}
          onFilterClick={handleFilterClick}
          onBreakMode={handleBreakMode}
          isOnBreak={isOnBreak}
        />
        
        {/* Performance Cards */}
        <PerformanceCards
          todaysEarnings={earningsToday}
          reliabilityScore={95}
          acceptanceRate={88}
        />
      </div>
      
      {/* Driver Menu */}
      <div className={isVerificationPending ? 'blur-sm pointer-events-none' : ''}>
        <DriverMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          driverName={user?.name || 'John Smith'}
          reliabilityScore={95}
          acceptanceRate={88}
        />
        
        {/* Bottom Navigation */}
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onMenuClose={() => setIsMenuOpen(false)}
        />
      </div>
      
      {/* Driver Verification Modal */}
      <DriverVerificationModal
        isOpen={isVerificationPending}
        driverName={user?.name || 'Driver'}
        email={user?.email || 'driver@example.com'}
      />
      
      {/* Notification Popup */}
      {pendingRequest && (
        <DriverNotification
          request={pendingRequest}
          onAccept={() => acceptRequestMutation.mutate(pendingRequest.id)}
          onDecline={handleDeclineRequest}
        />
      )}
    </div>
  );
}
