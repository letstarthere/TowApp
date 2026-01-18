import { useState } from 'react';
import { MapPin, Camera, Navigation, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { backgroundLocationManager } from '@/lib/backgroundLocation';
import { Geolocation } from '@capacitor/geolocation';

interface Step4Props {
  data: {
    locationPermissionGranted: boolean;
    backgroundLocationGranted: boolean;
    cameraPermissionGranted: boolean;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

interface PermissionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  whyNeeded: string;
  granted: boolean;
  onRequest: () => Promise<void>;
  required?: boolean;
}

function PermissionCard({ icon, title, description, whyNeeded, granted, onRequest, required = true }: PermissionCardProps) {
  const [requesting, setRequesting] = useState(false);

  const handleRequest = async () => {
    setRequesting(true);
    try {
      await onRequest();
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${
      granted ? 'border-green-600 bg-green-900/20' : 'border-gray-600 bg-gray-800'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {icon}
          <div>
            <h3 className="font-medium text-white">{title}</h3>
            {required && <span className="text-xs text-red-400">Required</span>}
          </div>
        </div>
        {granted && <CheckCircle className="w-6 h-6 text-green-400" />}
      </div>

      <p className="text-sm text-gray-300 mb-3">{description}</p>

      <div className="bg-gray-700/50 rounded p-3 mb-3">
        <p className="text-xs text-gray-400 mb-1">Why we need this:</p>
        <p className="text-sm text-gray-200">{whyNeeded}</p>
      </div>

      {!granted && (
        <Button
          onClick={handleRequest}
          disabled={requesting}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
        >
          {requesting ? 'Requesting...' : `Grant ${title}`}
        </Button>
      )}
    </div>
  );
}

export default function Step4Permissions({ data, onUpdate, onNext, onBack }: Step4Props) {
  const [error, setError] = useState<string>('');

  const requestLocationPermission = async () => {
    try {
      const permission = await Geolocation.requestPermissions();
      if (permission.location === 'granted') {
        onUpdate({ locationPermissionGranted: true });
      } else {
        setError('Location permission denied. This is required to receive job requests.');
      }
    } catch (error) {
      setError('Failed to request location permission');
    }
  };

  const requestBackgroundLocation = async () => {
    const granted = await backgroundLocationManager.requestPermissions();
    if (granted) {
      onUpdate({ backgroundLocationGranted: true });
    } else {
      setError('Background location permission is required for reliable job notifications');
    }
  };

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      onUpdate({ cameraPermissionGranted: true });
    } catch (error) {
      setError('Camera permission denied. This is needed to capture vehicle photos.');
    }
  };

  const handleNext = () => {
    if (!data.locationPermissionGranted || !data.backgroundLocationGranted || !data.cameraPermissionGranted) {
      setError('All permissions are required to continue. Please grant all permissions.');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Location & Camera Permissions</h2>
        <p className="text-gray-400">These permissions are essential for the driver app to function</p>
      </div>

      <div className="space-y-4">
        <PermissionCard
          icon={<MapPin className="w-6 h-6 text-orange-400" />}
          title="Location Access"
          description="Allow TOWAPP to access your location while using the app"
          whyNeeded="We need your location to show you nearby tow requests and help customers track your arrival in real-time."
          granted={data.locationPermissionGranted}
          onRequest={requestLocationPermission}
        />

        <PermissionCard
          icon={<Navigation className="w-6 h-6 text-orange-400" />}
          title="Background Location"
          description="Allow TOWAPP to access your location even when the app is closed"
          whyNeeded="This ensures you receive job notifications even when your phone is locked or you're using other apps. Critical for not missing opportunities."
          granted={data.backgroundLocationGranted}
          onRequest={requestBackgroundLocation}
        />

        <PermissionCard
          icon={<Camera className="w-6 h-6 text-orange-400" />}
          title="Camera Access"
          description="Allow TOWAPP to use your camera"
          whyNeeded="You'll need to take photos of vehicles before and after towing for documentation and customer transparency."
          granted={data.cameraPermissionGranted}
          onRequest={requestCameraPermission}
        />
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-sm text-red-300">{error}</span>
          </div>
        </div>
      )}

      <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
        <p className="text-sm text-blue-200">
          <strong>Privacy Note:</strong> Your location is only shared with customers during active tow jobs. 
          We never sell your location data to third parties.
        </p>
      </div>

      <div className="flex space-x-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!data.locationPermissionGranted || !data.backgroundLocationGranted || !data.cameraPermissionGranted}
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
        >
          Continue to Final Step
        </Button>
      </div>
    </div>
  );
}