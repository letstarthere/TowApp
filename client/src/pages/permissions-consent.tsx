import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Camera, Shield, Bell } from 'lucide-react';
import logoPath from '@assets/getstarted logo_1752240922747.png';

export default function PermissionsConsent() {
  const [, setLocation] = useLocation();
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const permissions = [
    {
      icon: MapPin,
      title: 'Location Access',
      description: 'Required to show nearby drivers and track your tow service in real-time',
      required: true
    },
    {
      icon: Camera,
      title: 'Camera Access',
      description: 'Used to capture photos of your vehicle for driver identification',
      required: true
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Receive updates about your tow request and driver arrival',
      required: false
    },
    {
      icon: MapPin,
      title: 'Background Location (Drivers)',
      description: 'Allows drivers to receive job requests while app is in background',
      required: false
    }
  ];

  const handleContinue = () => {
    if (!acceptedTerms) return;
    
    localStorage.setItem('permissions_accepted', 'true');
    setLocation('/role-selection');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center mb-8">
          <img src={logoPath} alt="TOWAPP" className="h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to TOWAPP</h1>
          <p className="text-gray-600">We need your permission to provide the best service</p>
        </div>

        <div className="space-y-4 mb-6">
          {permissions.map((permission, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <permission.icon className="w-6 h-6 text-orange-500" />
                  <span className="text-lg">{permission.title}</span>
                  {permission.required && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{permission.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I agree to the{' '}
                <button
                  onClick={() => setLocation('/terms')}
                  className="text-orange-500 underline"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  onClick={() => setLocation('/privacy')}
                  className="text-orange-500 underline"
                >
                  Privacy Policy
                </button>
              </label>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleContinue}
          disabled={!acceptedTerms}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg"
        >
          Continue
        </Button>

        <div className="mt-6 text-center">
          <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500">
            Your data is encrypted and secure. We never share your personal information.
          </p>
        </div>
      </div>
    </div>
  );
}