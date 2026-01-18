import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { Camera as CameraIcon, Upload, X, Car, ArrowLeft, Check } from "lucide-react";
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

type PhotoType = 'front' | 'back' | 'left' | 'right';

export default function PhotoCapture() {
  const [, setLocation] = useLocation();
  const [licensePlate, setLicensePlate] = useState('');
  const [carType, setCarType] = useState('');
  const [plateHistory, setPlateHistory] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [savedVehicle, setSavedVehicle] = useState<any>(null);
  const [showVehicleConfirm, setShowVehicleConfirm] = useState(false);
  const [useExistingVehicle, setUseExistingVehicle] = useState(false);
  const [photos, setPhotos] = useState<Record<PhotoType, string | null>>({
    front: null,
    back: null,
    left: null,
    right: null
  });
  const [currentPhotoType, setCurrentPhotoType] = useState<PhotoType | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load license plate history and saved vehicle on component mount
  useEffect(() => {
    const history = localStorage.getItem('licensePlateHistory');
    if (history) {
      setPlateHistory(JSON.parse(history));
    }
    
    const vehicle = localStorage.getItem('userVehicle');
    if (vehicle) {
      const vehicleData = JSON.parse(vehicle);
      setSavedVehicle(vehicleData);
      setShowVehicleConfirm(true);
    }
  }, []);

  const carTypes = [
    'Sedan', 'SUV', 'Hatchback', 'Coupe', 'Bakkie (Pickup)', 'Van', 'Other'
  ];

  const photoLabels = {
    front: 'Front View',
    back: 'Back View', 
    left: 'Left Side',
    right: 'Right Side'
  };

  const startCamera = async (photoType: PhotoType) => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });
      
      if (image.dataUrl) {
        setPhotos(prev => ({ ...prev, [photoType]: image.dataUrl! }));
      }
    } catch (error) {
      console.error('Camera error:', error);
    }
  };

  const selectFromGallery = async (photoType: PhotoType) => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });
      
      if (image.dataUrl) {
        setPhotos(prev => ({ ...prev, [photoType]: image.dataUrl! }));
      }
    } catch (error) {
      console.error('Gallery error:', error);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && currentPhotoType) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg');
      setPhotos(prev => ({ ...prev, [currentPhotoType]: imageData }));
      
      // Stop camera
      const stream = video.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setIsCapturing(false);
      setCurrentPhotoType(null);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, photoType: PhotoType) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotos(prev => ({ ...prev, [photoType]: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = () => {
    const allPhotosUploaded = Object.values(photos).every(photo => photo !== null);
    const hasVehicleDetails = useExistingVehicle || (licensePlate.trim() && carType);
    
    if (hasVehicleDetails && allPhotosUploaded) {
      if (useExistingVehicle && savedVehicle) {
        localStorage.setItem('carType', `${savedVehicle.brand} ${savedVehicle.model}`);
        localStorage.setItem('licensePlate', 'Saved Vehicle');
      } else {
        localStorage.setItem('licensePlate', licensePlate);
        localStorage.setItem('carType', carType);
        
        // Save license plate to history
        const updatedHistory = [licensePlate.toUpperCase(), ...plateHistory.filter(plate => plate !== licensePlate.toUpperCase())].slice(0, 5);
        localStorage.setItem('licensePlateHistory', JSON.stringify(updatedHistory));
      }
      
      localStorage.setItem('carPhotos', JSON.stringify(photos));
      
      // Make sure we have a requestType set
      if (!localStorage.getItem('requestType')) {
        localStorage.setItem('requestType', 'REQUEST_NOW');
      }
      
      // Navigate with a slight delay to ensure localStorage is updated
      setTimeout(() => {
        window.location.href = '/user-map';
      }, 100);
    }
  };

  const retakePhoto = (photoType: PhotoType) => {
    setPhotos(prev => ({ ...prev, [photoType]: null }));
  };

  const isFormComplete = () => {
    const allPhotosUploaded = Object.values(photos).every(photo => photo !== null);
    const hasVehicleDetails = useExistingVehicle || (licensePlate.trim() && carType);
    return hasVehicleDetails && allPhotosUploaded;
  };

  const handleUseExistingVehicle = () => {
    setUseExistingVehicle(true);
    setShowVehicleConfirm(false);
  };

  const handleEnterDifferentDetails = () => {
    setUseExistingVehicle(false);
    setShowVehicleConfirm(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation('/service-selection')}
          className="w-10 h-10 rounded-full bg-white shadow-lg hover:bg-gray-50"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Button>
      </div>
      
      <div className="text-center pt-16 pb-8">
        <h1 className="text-3xl font-bold text-towapp-black mb-4">
          Request Confirmation
        </h1>
        <p className="text-gray-600 px-6">
          Please provide your car details and photos for driver identification.
        </p>
      </div>

      <div className="px-6 pb-6 space-y-8">
        {/* Vehicle Confirmation */}
        {showVehicleConfirm && savedVehicle && (
          <Card className="border-2 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <Car className="w-6 h-6 text-orange-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Is this your vehicle?</h3>
                  <p className="text-sm text-gray-600">
                    {savedVehicle.brand} {savedVehicle.model} ({savedVehicle.type})
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={handleUseExistingVehicle}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Yes, use this vehicle
                </Button>
                <Button
                  onClick={handleEnterDifferentDetails}
                  variant="outline"
                  className="flex-1 border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  No, enter different details
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vehicle Details Form - Only show if not using existing vehicle */}
        {!useExistingVehicle && (
          <>
            {/* License Plate */}
        <div className="relative">
          <h3 className="font-semibold text-lg text-black mb-4">License Plate Number</h3>
          <Input
            value={licensePlate}
            onChange={(e) => {
              setLicensePlate(e.target.value.toUpperCase());
              setShowSuggestions(e.target.value.length > 0 && plateHistory.length > 0);
            }}
            onFocus={() => setShowSuggestions(plateHistory.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="text-center text-xl font-bold py-4 px-4 rounded-xl border-2 border-gray-200 focus:border-orange-500"
            placeholder="ABC 123 GP"
            maxLength={10}
          />
          
          {/* Suggestions dropdown */}
          {showSuggestions && plateHistory.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border-2 border-gray-200 rounded-xl mt-1 shadow-lg z-10">
              <div className="p-2">
                <p className="text-xs text-gray-500 mb-2 px-2">Recent license plates:</p>
                {plateHistory.map((plate, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setLicensePlate(plate);
                      setShowSuggestions(false);
                    }}
                    className="px-3 py-2 hover:bg-orange-50 cursor-pointer rounded-lg text-center font-bold text-gray-800"
                  >
                    {plate}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

            {/* Car Type */}
            <div>
              <h3 className="font-semibold text-lg text-towapp-black mb-4">Car Type</h3>
              <Select value={carType} onValueChange={setCarType}>
                <SelectTrigger className="py-4 px-4 rounded-xl border-2 border-gray-200">
                  <SelectValue placeholder="Select your car type" />
                </SelectTrigger>
                <SelectContent>
                  {carTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Car Photos */}
        <div>
          <h3 className="font-semibold text-lg text-towapp-black mb-4">Car Photos (4 required)</h3>
          <div className="grid grid-cols-2 gap-4">
            {(Object.keys(photos) as PhotoType[]).map((photoType) => (
              <div key={photoType} className="space-y-2">
                <p className="text-sm font-medium text-gray-700">{photoLabels[photoType]}</p>
                {photos[photoType] ? (
                  <div className="relative">
                    <img
                      src={photos[photoType]!}
                      alt={`Car ${photoType}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      onClick={() => retakePhoto(photoType)}
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button
                      onClick={() => selectFromGallery(photoType)}
                      variant="outline"
                      className="w-full h-16 border-2 border-dashed border-gray-300 hover:border-towapp-orange flex flex-col items-center justify-center"
                    >
                      <Upload className="w-6 h-6 mb-1" />
                      <span className="text-sm">From Gallery</span>
                    </Button>
                    <Button
                      onClick={() => startCamera(photoType)}
                      variant="outline"
                      className="w-full h-16 border-2 border-dashed border-gray-300 hover:border-towapp-orange flex flex-col items-center justify-center"
                    >
                      <CameraIcon className="w-6 h-6 mb-1" />
                      <span className="text-sm">Take Photo</span>
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Camera View */}
      {isCapturing && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 space-x-4">
                <Button
                  onClick={capturePhoto}
                  className="bg-towapp-orange hover:bg-orange-600 text-white rounded-full w-16 h-16"
                >
                  <Camera className="w-6 h-6" />
                </Button>
                <Button
                  onClick={() => {
                    setIsCapturing(false);
                    setCurrentPhotoType(null);
                  }}
                  variant="outline"
                  className="rounded-full w-16 h-16"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t">
        <Button
          onClick={handleContinue}
          disabled={!isFormComplete()}
          className="w-full bg-towapp-orange hover:bg-orange-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg disabled:opacity-50"
        >
          Confirm Request
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => currentPhotoType && handleFileUpload(e, currentPhotoType)}
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />
      

    </div>
  );
}