import { Truck, CreditCard, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { validateLicenseNumber, validateLicenseExpiry, validateVehicleReg } from '@/lib/signupValidation';
import { useState } from 'react';

interface Step2Props {
  data: {
    licenseNumber: string;
    licenseExpiry: string;
    towTruckType: string;
    vehicleRegistration: string;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const truckTypes = [
  { value: 'flatbed', label: 'Flatbed Truck' },
  { value: 'hook_chain', label: 'Hook & Chain' },
  { value: 'rollback', label: 'Rollback/Slide Deck' },
  { value: 'wheel_lift', label: 'Wheel Lift' },
  { value: 'heavy_duty', label: 'Heavy Duty Wrecker' },
  { value: 'integrated', label: 'Integrated Tow Truck' }
];

export default function Step2Vehicle({ data, onUpdate, onNext, onBack }: Step2Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const licenseValidation = validateLicenseNumber(data.licenseNumber);
    if (!licenseValidation.isValid) newErrors.licenseNumber = licenseValidation.message!;

    const expiryValidation = validateLicenseExpiry(data.licenseExpiry);
    if (!expiryValidation.isValid) newErrors.licenseExpiry = expiryValidation.message!;

    if (!data.towTruckType) newErrors.towTruckType = 'Please select your tow truck type';

    const vehicleValidation = validateVehicleReg(data.vehicleRegistration);
    if (!vehicleValidation.isValid) newErrors.vehicleRegistration = vehicleValidation.message!;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Driver & Vehicle Information</h2>
        <p className="text-gray-400">We need to verify your credentials and vehicle details</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <CreditCard className="w-4 h-4 inline mr-2" />
            Driver License Number
          </label>
          <Input
            value={data.licenseNumber}
            onChange={(e) => onUpdate({ licenseNumber: e.target.value })}
            placeholder="Enter your driver license number"
            className="bg-gray-800 border-gray-600 text-white"
          />
          {errors.licenseNumber && <p className="text-red-400 text-sm mt-1">{errors.licenseNumber}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            License Expiry Date
          </label>
          <Input
            type="date"
            value={data.licenseExpiry}
            onChange={(e) => onUpdate({ licenseExpiry: e.target.value })}
            className="bg-gray-800 border-gray-600 text-white"
          />
          {errors.licenseExpiry && <p className="text-red-400 text-sm mt-1">{errors.licenseExpiry}</p>}
          <p className="text-xs text-gray-400 mt-1">License must be valid for at least 6 months</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Truck className="w-4 h-4 inline mr-2" />
            Tow Truck Type
          </label>
          <Select value={data.towTruckType} onValueChange={(value) => onUpdate({ towTruckType: value })}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Select your tow truck type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {truckTypes.map((type) => (
                <SelectItem key={type.value} value={type.value} className="text-white hover:bg-gray-700">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.towTruckType && <p className="text-red-400 text-sm mt-1">{errors.towTruckType}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Vehicle Registration Number
          </label>
          <Input
            value={data.vehicleRegistration}
            onChange={(e) => onUpdate({ vehicleRegistration: e.target.value.toUpperCase() })}
            placeholder="ABC-123-GP"
            className="bg-gray-800 border-gray-600 text-white"
          />
          {errors.vehicleRegistration && <p className="text-red-400 text-sm mt-1">{errors.vehicleRegistration}</p>}
        </div>
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
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
        >
          Continue to Documents
        </Button>
      </div>
    </div>
  );
}