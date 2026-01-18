import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, CheckCircle, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import CameraCapture from '@/components/CameraCapture';

export default function DriverArrival() {
  const [, setLocation] = useLocation();
  const [photoTaken, setPhotoTaken] = useState(false);
  const [vehicleHooked, setVehicleHooked] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleTakePhoto = () => {
    setShowCamera(true);
  };

  const handlePhotoCapture = async (file: File) => {
    setShowCamera(false);
    setUploading(true);
    
    try {
      // TODO: Get actual trip ID from context/props
      const tripId = '123';
      
      const formData = new FormData();
      formData.append('photo', file);
      
      const response = await fetch(`/api/requests/${tripId}/upload/pre-tow`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        setPhotoTaken(true);
      } else {
        alert('Failed to upload photo');
      }
    } catch (error) {
      alert('Error uploading photo');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmHookup = () => {
    setVehicleHooked(true);
  };

  const handleStartTransit = async () => {
    if (!photoTaken || !vehicleHooked) return;
    
    try {
      // TODO: Update trip status to IN_TRANSIT
      const tripId = '123';
      const response = await fetch(`/api/requests/${tripId}/in-transit`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        setLocation('/driver-in-transit');
      }
    } catch (error) {
      alert('Failed to start transit');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation('/driver-map')}
          className="mr-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold">Vehicle Pickup</h1>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Arrival Checklist</h2>
          
          {/* Photo Step */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
                  photoTaken ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  {photoTaken && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
                <span className="font-medium">Take Pre-Tow Photo</span>
              </div>
              {photoTaken && <span className="text-green-600 text-sm">✓ Complete</span>}
            </div>
            <p className="text-gray-600 text-sm mb-3 ml-9">
              Document vehicle condition before towing
            </p>
            {!photoTaken && !uploading && (
              <Button
                onClick={handleTakePhoto}
                className="ml-9 bg-towapp-orange hover:bg-orange-600"
              >
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
            )}
            {uploading && (
              <div className="ml-9 text-sm text-gray-600">
                Uploading photo...
              </div>
            )}
          </div>

          {/* Hookup Step */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
                  vehicleHooked ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  {vehicleHooked && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
                <span className="font-medium">Confirm Vehicle Hookup</span>
              </div>
              {vehicleHooked && <span className="text-green-600 text-sm">✓ Complete</span>}
            </div>
            <p className="text-gray-600 text-sm mb-3 ml-9">
              Ensure vehicle is securely attached to tow truck
            </p>
            {!vehicleHooked && (
              <Button
                onClick={handleConfirmHookup}
                variant="outline"
                className="ml-9"
              >
                Confirm Hookup
              </Button>
            )}
          </div>
        </div>

        {/* Start Transit Button */}
        <Button
          onClick={handleStartTransit}
          disabled={!photoTaken || !vehicleHooked}
          className="w-full h-12 bg-towapp-orange hover:bg-orange-600 disabled:opacity-50"
        >
          Start Transit to Destination
        </Button>
      </div>
      
      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          title="Pre-Tow Vehicle Photo"
          onCapture={handlePhotoCapture}
          onCancel={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}