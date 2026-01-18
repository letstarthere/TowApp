import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, MapPin, User, Car } from "lucide-react";
import type { RequestWithDetails } from "@/lib/types";

interface DriverNotificationProps {
  request: RequestWithDetails;
  onAccept: () => void;
  onDecline: () => void;
}

export default function DriverNotification({ request, onAccept, onDecline }: DriverNotificationProps) {
  useEffect(() => {
    // Play notification sound
    const audio = new Audio('/attached_assets/TowApp_Notification_Driver.mp3');
    audio.play().catch(error => {
      console.log('Could not play notification sound:', error);
    });
  }, []);

  // Get car details from localStorage (since they're stored there)
  const licensePlate = localStorage.getItem('licensePlate') || 'Not specified';
  const carType = localStorage.getItem('carType') || 'Not specified';
  const carPhotosString = localStorage.getItem('carPhotos');
  const carPhotos = carPhotosString ? JSON.parse(carPhotosString) : {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-black">New Tow Request</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDecline}
              className="w-8 h-8 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Customer Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <User className="w-4 h-4 text-gray-600" />
              <span className="font-semibold text-black">Customer</span>
            </div>
            <p className="text-lg font-bold text-black">{request.user.name}</p>
            <p className="text-sm text-gray-600">{request.user.phone}</p>
          </div>

          {/* Location Info */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-blue-800">Pickup Location</span>
            </div>
            <p className="text-sm text-blue-700">{request.pickupAddress}</p>
            {request.dropoffAddress && (
              <>
                <div className="flex items-center space-x-2 mt-2 mb-1">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-800">Destination</span>
                </div>
                <p className="text-sm text-green-700">{request.dropoffAddress}</p>
              </>
            )}
          </div>

          {/* Vehicle Info */}
          <div className="mb-4 p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Car className="w-4 h-4 text-orange-600" />
              <span className="font-semibold text-orange-800">Vehicle Details</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-orange-700">
                <span className="font-medium">Type:</span> {carType}
              </p>
              <p className="text-sm text-orange-700">
                <span className="font-medium">License:</span> {licensePlate}
              </p>
              <p className="text-sm text-orange-700">
                <span className="font-medium">Service:</span> {request.serviceType || 'Standard'}
              </p>
            </div>
          </div>

          {/* Car Photos */}
          {Object.keys(carPhotos).length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-black mb-2">Vehicle Photos</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(carPhotos).map(([position, photo]) => (
                  photo && (
                    <div key={position} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={photo as string} 
                        alt={`Vehicle ${position}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        {position}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Fee */}
          <div className="mb-6 p-3 bg-green-50 rounded-lg text-center">
            <p className="text-sm text-green-700 mb-1">Estimated Fee</p>
            <p className="text-2xl font-bold text-green-800">R{request.estimatedPrice}</p>
          </div>

          {/* Accept Button */}
          <Button
            onClick={onAccept}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg"
          >
            Accept Request
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}