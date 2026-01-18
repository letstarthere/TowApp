import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, User, FileText, CheckCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import CameraCapture from '@/components/CameraCapture';
import SignaturePad from '@/components/SignaturePad';

export default function DriverDestinationArrival() {
  const [, setLocation] = useLocation();
  const [recipientType, setRecipientType] = useState<'user' | 'other' | null>(null);
  const [recipientName, setRecipientName] = useState('');
  const [signatureTaken, setSignatureTaken] = useState(false);
  const [idPhotoTaken, setIdPhotoTaken] = useState(false);
  const [postTowPhotoTaken, setPostTowPhotoTaken] = useState(false);
  const [vehicleOffloaded, setVehicleOffloaded] = useState(false);
  const [showCamera, setShowCamera] = useState<'id' | 'post-tow' | null>(null);
  const [showSignature, setShowSignature] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleRecipientTypeSelect = (type: 'user' | 'other') => {
    setRecipientType(type);
  };

  const handleTakeSignature = () => {
    setShowSignature(true);
  };

  const handleSignatureSave = async (signature: string) => {
    setShowSignature(false);
    setUploading(true);
    
    try {
      const tripId = '123'; // TODO: Get from context
      
      const response = await fetch(`/api/requests/${tripId}/signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature, recipientName })
      });
      
      if (response.ok) {
        setSignatureTaken(true);
      } else {
        alert('Failed to save signature');
      }
    } catch (error) {
      alert('Error saving signature');
    } finally {
      setUploading(false);
    }
  };

  const handleTakeIdPhoto = () => {
    setShowCamera('id');
  };

  const handleTakePostTowPhoto = () => {
    setShowCamera('post-tow');
  };

  const handlePhotoCapture = async (file: File) => {
    setShowCamera(null);
    setUploading(true);
    
    try {
      const tripId = '123'; // TODO: Get from context
      const type = showCamera === 'id' ? 'id-photo' : 'post-tow';
      
      const formData = new FormData();
      formData.append('photo', file);
      
      const response = await fetch(`/api/requests/${tripId}/upload/${type}`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        if (type === 'id-photo') {
          setIdPhotoTaken(true);
        } else {
          setPostTowPhotoTaken(true);
        }
      } else {
        alert('Failed to upload photo');
      }
    } catch (error) {
      alert('Error uploading photo');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmOffload = () => {
    setVehicleOffloaded(true);
  };

  const handleCompleteTrip = async () => {
    // Check if all required steps are complete
    const isUserRecipient = recipientType === 'user';
    const isOtherRecipient = recipientType === 'other' && recipientName && signatureTaken && idPhotoTaken;
    
    if ((isUserRecipient || isOtherRecipient) && postTowPhotoTaken && vehicleOffloaded) {
      try {
        const tripId = '123'; // TODO: Get from context
        
        const response = await fetch(`/api/requests/${tripId}/complete`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientType,
            actualPrice: 375.00 // TODO: Calculate actual price
          })
        });
        
        if (response.ok) {
          setLocation('/trip-invoice');
        } else {
          alert('Failed to complete trip');
        }
      } catch (error) {
        alert('Error completing trip');
      }
    }
  };

  const canComplete = () => {
    if (recipientType === 'user') {
      return postTowPhotoTaken && vehicleOffloaded;
    }
    if (recipientType === 'other') {
      return recipientName && signatureTaken && idPhotoTaken && postTowPhotoTaken && vehicleOffloaded;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <h1 className="text-lg font-semibold">Destination Arrival</h1>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-6">
        {/* Recipient Selection */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="font-semibold mb-4">Who will receive the vehicle?</h2>
          <div className="space-y-3">
            <Button
              variant={recipientType === 'user' ? 'default' : 'outline'}
              onClick={() => handleRecipientTypeSelect('user')}
              className="w-full justify-start"
            >
              <User className="w-4 h-4 mr-2" />
              The customer themselves
            </Button>
            <Button
              variant={recipientType === 'other' ? 'default' : 'outline'}
              onClick={() => handleRecipientTypeSelect('other')}
              className="w-full justify-start"
            >
              <FileText className="w-4 h-4 mr-2" />
              Someone else (requires verification)
            </Button>
          </div>
        </div>

        {/* Third Party Verification */}
        {recipientType === 'other' && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold mb-4">Recipient Verification</h3>
            
            {/* Name Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Recipient Full Name</label>
              <Input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Enter full name"
              />
            </div>

            {/* Signature */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Digital Signature</span>
                {signatureTaken && <CheckCircle className="w-4 h-4 text-green-600" />}
              </div>
              {!signatureTaken && !uploading && (
                <Button onClick={handleTakeSignature} variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Capture Signature
                </Button>
              )}
              {uploading && (
                <div className="text-sm text-gray-600">Processing...</div>
              )}
            </div>

            {/* ID Photo */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">ID Document Photo</span>
                {idPhotoTaken && <CheckCircle className="w-4 h-4 text-green-600" />}
              </div>
              {!idPhotoTaken && !uploading && (
                <Button onClick={handleTakeIdPhoto} variant="outline" size="sm">
                  <Camera className="w-4 h-4 mr-2" />
                  Scan ID Document
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Vehicle Offload */}
        {recipientType && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold mb-4">Vehicle Delivery</h3>
            
            {/* Post-Tow Photo */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Post-Tow Photo</span>
                {postTowPhotoTaken && <CheckCircle className="w-4 h-4 text-green-600" />}
              </div>
              <p className="text-xs text-gray-600 mb-2">
                Document vehicle condition at destination
              </p>
              {!postTowPhotoTaken && !uploading && (
                <Button onClick={handleTakePostTowPhoto} variant="outline" size="sm">
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
              )}
            </div>

            {/* Offload Confirmation */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Vehicle Offloaded</span>
                {vehicleOffloaded && <CheckCircle className="w-4 h-4 text-green-600" />}
              </div>
              {!vehicleOffloaded && (
                <Button onClick={handleConfirmOffload} variant="outline" size="sm">
                  Confirm Offload Complete
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Complete Trip Button */}
        <Button
          onClick={handleCompleteTrip}
          disabled={!canComplete()}
          className="w-full h-12 bg-towapp-orange hover:bg-orange-600 disabled:opacity-50"
        >
          Complete Trip
        </Button>
      </div>
      
      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          title={showCamera === 'id' ? 'ID Document Photo' : 'Post-Tow Vehicle Photo'}
          onCapture={handlePhotoCapture}
          onCancel={() => setShowCamera(null)}
        />
      )}
      
      {/* Signature Modal */}
      {showSignature && (
        <SignaturePad
          onSave={handleSignatureSave}
          onCancel={() => setShowSignature(false)}
        />
      )}
    </div>
  );
}