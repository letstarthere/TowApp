import { useState } from 'react';
import { Eye, EyeOff, User, Mail, Phone, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { validateEmail, validatePhone, validatePassword } from '@/lib/signupValidation';

interface Step1Props {
  data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export default function Step1Account({ data, onUpdate, onNext }: Step1Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!data.fullName.trim()) newErrors.fullName = 'Full name is required';
    
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.isValid) newErrors.email = emailValidation.message!;
    
    const phoneValidation = validatePhone(data.phone);
    if (!phoneValidation.isValid) newErrors.phone = phoneValidation.message!;
    
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) newErrors.password = passwordValidation.message!;
    
    if (data.password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

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
        <h2 className="text-2xl font-bold text-white mb-2">Create Your Driver Account</h2>
        <p className="text-gray-400">Join TOWAPP's network of professional drivers</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Full Name
          </label>
          <Input
            value={data.fullName}
            onChange={(e) => onUpdate({ fullName: e.target.value })}
            placeholder="Enter your full name"
            className="bg-gray-800 border-gray-600 text-white"
          />
          {errors.fullName && <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Email Address
          </label>
          <Input
            type="email"
            value={data.email}
            onChange={(e) => onUpdate({ email: e.target.value })}
            placeholder="your.email@example.com"
            className="bg-gray-800 border-gray-600 text-white"
          />
          {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Mobile Number
          </label>
          <Input
            value={data.phone}
            onChange={(e) => onUpdate({ phone: e.target.value })}
            placeholder="+27123456789"
            className="bg-gray-800 border-gray-600 text-white"
          />
          {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Lock className="w-4 h-4 inline mr-2" />
            Password
          </label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={data.password}
              onChange={(e) => onUpdate({ password: e.target.value })}
              placeholder="Create a strong password"
              className="bg-gray-800 border-gray-600 text-white pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
          <div className="mt-2 text-xs text-gray-400">
            Password must contain: 8+ characters, uppercase, lowercase, and numbers
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Lock className="w-4 h-4 inline mr-2" />
            Confirm Password
          </label>
          <Input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            className="bg-gray-800 border-gray-600 text-white"
          />
          {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
        </div>
      </div>

      <Button
        onClick={handleNext}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3"
      >
        Continue to Vehicle Information
      </Button>
    </div>
  );
}