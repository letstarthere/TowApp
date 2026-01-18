import { useState } from 'react';
import { useLocation } from 'wouter';
import { Car, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import logoPath from '@assets/blackapplogo.png';

const vehicleBrands = [
  'Toyota', 'Volkswagen', 'BMW', 'Mercedes-Benz', 'Audi', 'Ford', 'Chevrolet', 
  'Nissan', 'Hyundai', 'Kia', 'Mazda', 'Isuzu', 'Mitsubishi', 'Renault', 'Other'
];

const vehicleTypes = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'suv', label: 'SUV' },
  { value: 'bakkie', label: 'Bakkie/Pickup' },
  { value: 'truck', label: 'Truck' },
  { value: 'van', label: 'Van' },
  { value: 'coupe', label: 'Coupe' },
  { value: 'other', label: 'Other' }
];

export default function UserVehicleSetup() {
  const [, setLocation] = useLocation();
  const [vehicleData, setVehicleData] = useState({
    brand: '',
    model: '',
    type: ''
  });

  const handleSave = () => {
    // Save vehicle data to localStorage or API
    if (vehicleData.brand && vehicleData.model && vehicleData.type) {
      localStorage.setItem('userVehicle', JSON.stringify(vehicleData));
    }
    setLocation('/home');
  };

  const handleSkip = () => {
    setLocation('/home');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 p-4">
        <div className="max-w-md mx-auto text-center">
          <img src={logoPath} alt="TOWAPP" className="h-8 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900">Add Your Vehicle</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-6 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Tell us about your vehicle</h2>
          <p className="text-gray-600">
            This helps us provide faster service and better cost estimates
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Brand
            </label>
            <Select value={vehicleData.brand} onValueChange={(value) => setVehicleData(prev => ({ ...prev, brand: value }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your vehicle brand" />
              </SelectTrigger>
              <SelectContent>
                {vehicleBrands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Model
            </label>
            <Input
              value={vehicleData.model}
              onChange={(e) => setVehicleData(prev => ({ ...prev, model: e.target.value }))}
              placeholder="e.g. Corolla, Golf, 3 Series"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Type
            </label>
            <Select value={vehicleData.type} onValueChange={(value) => setVehicleData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <Button
            onClick={handleSave}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3"
          >
            Save Vehicle Details
          </Button>
          
          <Button
            onClick={handleSkip}
            variant="ghost"
            className="w-full text-gray-600 hover:text-gray-800"
          >
            Skip for now
          </Button>
        </div>

        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Don't worry!</strong> You can always add or change your vehicle details later in 
            <span className="inline-flex items-center mx-1">
              Account <ChevronRight className="w-3 h-3 mx-1" /> My Vehicles
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}