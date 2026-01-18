export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return { isValid: false, message: 'Email is required' };
  if (!emailRegex.test(email)) return { isValid: false, message: 'Please enter a valid email address' };
  return { isValid: true };
};

export const validatePhone = (phone: string): ValidationResult => {
  const phoneRegex = /^\+27[0-9]{9}$/;
  if (!phone) return { isValid: false, message: 'Phone number is required' };
  if (!phoneRegex.test(phone)) return { isValid: false, message: 'Please enter a valid South African number (+27xxxxxxxxx)' };
  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) return { isValid: false, message: 'Password is required' };
  if (password.length < 8) return { isValid: false, message: 'Password must be at least 8 characters' };
  if (!/(?=.*[a-z])/.test(password)) return { isValid: false, message: 'Password must contain lowercase letters' };
  if (!/(?=.*[A-Z])/.test(password)) return { isValid: false, message: 'Password must contain uppercase letters' };
  if (!/(?=.*\d)/.test(password)) return { isValid: false, message: 'Password must contain numbers' };
  return { isValid: true };
};

export const validateLicenseNumber = (license: string): ValidationResult => {
  if (!license) return { isValid: false, message: 'Driver license number is required' };
  if (license.length < 8) return { isValid: false, message: 'Please enter a valid license number' };
  return { isValid: true };
};

export const validateLicenseExpiry = (date: string): ValidationResult => {
  if (!date) return { isValid: false, message: 'License expiry date is required' };
  const expiryDate = new Date(date);
  const today = new Date();
  if (expiryDate <= today) return { isValid: false, message: 'License must be valid for at least 6 months' };
  
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  if (expiryDate < sixMonthsFromNow) return { isValid: false, message: 'License must be valid for at least 6 months' };
  
  return { isValid: true };
};

export const validateVehicleReg = (reg: string): ValidationResult => {
  if (!reg) return { isValid: false, message: 'Vehicle registration is required' };
  if (reg.length < 6) return { isValid: false, message: 'Please enter a valid registration number' };
  return { isValid: true };
};

export const validateFile = (file: File | null, type: 'image' | 'document'): ValidationResult => {
  if (!file) return { isValid: false, message: 'File is required' };
  
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) return { isValid: false, message: 'File must be smaller than 5MB' };
  
  const allowedTypes = type === 'image' 
    ? ['image/jpeg', 'image/png', 'image/jpg']
    : ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, message: `Please upload a valid ${type === 'image' ? 'image' : 'document'} file` };
  }
  
  return { isValid: true };
};