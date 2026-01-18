import { useState } from 'react';
import { Upload, FileText, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { validateFile } from '@/lib/signupValidation';

interface Step3Props {
  data: {
    driverLicenseFront: File | null;
    driverLicenseBack: File | null;
    vehicleRegistrationDoc: File | null;
    profilePhoto: File | null;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

interface FileUploadProps {
  label: string;
  icon: React.ReactNode;
  file: File | null;
  onFileSelect: (file: File) => void;
  accept: string;
  guidance: string;
  required?: boolean;
}

function FileUpload({ label, icon, file, onFileSelect, accept, guidance, required = true }: FileUploadProps) {
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validation = validateFile(selectedFile, accept.includes('image') ? 'image' : 'document');
    if (!validation.isValid) {
      setError(validation.message!);
      return;
    }

    setError('');
    onFileSelect(selectedFile);
  };

  return (
    <div className="border border-gray-600 rounded-lg p-4 bg-gray-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {icon}
          <span className="font-medium text-white">{label}</span>
          {required && <span className="text-red-400">*</span>}
        </div>
        {file && <CheckCircle className="w-5 h-5 text-green-400" />}
      </div>

      <p className="text-sm text-gray-400 mb-3">{guidance}</p>

      <div className="relative">
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          file ? 'border-green-400 bg-green-400/10' : 'border-gray-600 hover:border-gray-500'
        }`}>
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-300">
            {file ? file.name : 'Click to upload or drag and drop'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Max 5MB • JPG, PNG, PDF</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 mt-2 text-red-400">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
}

export default function Step3Documents({ data, onUpdate, onNext, onBack }: Step3Props) {
  const [errors, setErrors] = useState<string[]>([]);

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!data.driverLicenseFront) newErrors.push('Driver license front is required');
    if (!data.driverLicenseBack) newErrors.push('Driver license back is required');
    if (!data.vehicleRegistrationDoc) newErrors.push('Vehicle registration document is required');
    if (!data.profilePhoto) newErrors.push('Profile photo is required');

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Identity & Compliance Documents</h2>
        <p className="text-gray-400">Upload clear, readable photos of your documents</p>
      </div>

      <div className="space-y-6">
        <FileUpload
          label="Driver License (Front)"
          icon={<FileText className="w-5 h-5 text-orange-400" />}
          file={data.driverLicenseFront}
          onFileSelect={(file) => onUpdate({ driverLicenseFront: file })}
          accept="image/*"
          guidance="Clear photo of the front of your driver license. Ensure all text is readable and corners are visible."
        />

        <FileUpload
          label="Driver License (Back)"
          icon={<FileText className="w-5 h-5 text-orange-400" />}
          file={data.driverLicenseBack}
          onFileSelect={(file) => onUpdate({ driverLicenseBack: file })}
          accept="image/*"
          guidance="Clear photo of the back of your driver license. Include any endorsements or restrictions."
        />

        <FileUpload
          label="Vehicle Registration Document"
          icon={<FileText className="w-5 h-5 text-orange-400" />}
          file={data.vehicleRegistrationDoc}
          onFileSelect={(file) => onUpdate({ vehicleRegistrationDoc: file })}
          accept="image/*,application/pdf"
          guidance="Upload your vehicle registration certificate or renewal disc. Document must show current registration status."
        />

        <FileUpload
          label="Profile Photo"
          icon={<Camera className="w-5 h-5 text-orange-400" />}
          file={data.profilePhoto}
          onFileSelect={(file) => onUpdate({ profilePhoto: file })}
          accept="image/*"
          guidance="Professional headshot photo. This will be visible to customers when you accept their tow requests."
        />
      </div>

      {errors.length > 0 && (
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="font-medium text-red-400">Please complete all required uploads</span>
          </div>
          <ul className="text-sm text-red-300 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

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
          Continue to Permissions
        </Button>
      </div>
    </div>
  );
}