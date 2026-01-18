import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star } from "lucide-react";
import driverProfileImage from "../../../attached_assets/driver_profile_image.png";
import towTruckImage from "../../../attached_assets/white-long-flatbed-tow-truck.svg";
import delegationIcon from "../../../attached_assets/delegationicon.png";

interface DrivingToDestinationProps {
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
  onDriverNotified?: (delegateName: string, delegateNumber: string) => void;
  onDestinationArrived?: () => void;
}

export default function DrivingToDestination({ driver, onDriverNotified, onDestinationArrived }: DrivingToDestinationProps) {
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [delegateName, setDelegateName] = useState("");
  const [delegateNumber, setDelegateNumber] = useState("");
  const [isDelegated, setIsDelegated] = useState(false);
  const [delegateInfo, setDelegateInfo] = useState<{name: string, number: string} | null>(null);

  // Add 30-second timer for destination arrival
  useEffect(() => {
    const timer = setTimeout(() => {
      onDestinationArrived?.();
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, [onDestinationArrived]);

  const handleDelegate = () => {
    if (delegateName.trim()) {
      const name = delegateName.trim();
      const number = delegateNumber.trim() || "Not provided";
      setDelegateInfo({ name, number });
      setIsDelegated(true);
      setShowDelegateModal(false);
      onDriverNotified?.(name, number);
    }
  };

  return (
    <div className="bg-white p-6 flex flex-col h-full">
      <h2 className="text-2xl font-bold text-center mb-4 text-black">Driving to Destination</h2>
      <p className="text-center text-gray-600 mb-6">Your vehicle is being transported to the destination</p>
      
      {/* Driver and truck layout - same as driver has arrived */}
      <div className="flex items-start space-x-6 mb-6">
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

      {/* Separator line */}
      <div className="w-full h-px bg-black mb-6" style={{ opacity: '1' }}></div>

      {/* Delegate Section */}
      {!isDelegated && (
        <div className="mb-6 flex flex-col items-center" style={{ marginTop: '-1rem' }}>
          <div 
            className="w-24 h-24 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors mb-2"
            onClick={() => setShowDelegateModal(true)}
          >
            <img 
              src={delegationIcon} 
              alt="Delegation" 
              className="w-12 h-12 object-contain"
            />
          </div>
          <span className="font-medium text-black text-sm">Delegate</span>
        </div>
      )}

      {/* Delegated Card */}
      {isDelegated && delegateInfo && (
        <div className="bg-orange-500 text-white p-4 rounded-lg">
          <p className="font-semibold">Receiving delegated to:</p>
          <p>{delegateInfo.name}</p>
          <p>{delegateInfo.number}</p>
        </div>
      )}

      {/* Delegate Modal */}
      <Dialog open={showDelegateModal} onOpenChange={setShowDelegateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delegate Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Can't be there to receive your car? Delegate to someone you trust. They'll need an identification document and will be requested to sign.
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Name</label>
                <Input
                  value={delegateName}
                  onChange={(e) => setDelegateName(e.target.value)}
                  placeholder="Enter delegate's full name"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Phone Number</label>
                <Input
                  value={delegateNumber}
                  onChange={(e) => setDelegateNumber(e.target.value)}
                  placeholder="Enter delegate's phone number"
                  className="w-full"
                />
              </div>
            </div>
            
            <p className="text-sm text-gray-500">
              Please ensure the person is present for collection, otherwise the driver will not be able to complete the delivery.
            </p>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDelegateModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelegate}
                disabled={!delegateName.trim()}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                Delegate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}