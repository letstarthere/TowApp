export interface SignupData {
  // Step 1: Account Creation
  fullName: string;
  email: string;
  phone: string;
  password: string;
  
  // Step 2: Driver & Vehicle Info
  licenseNumber: string;
  licenseExpiry: string;
  towTruckType: string;
  vehicleRegistration: string;
  
  // Step 3: Documents
  driverLicenseFront: File | null;
  driverLicenseBack: File | null;
  vehicleRegistrationDoc: File | null;
  profilePhoto: File | null;
  
  // Step 4: Permissions
  locationPermissionGranted: boolean;
  backgroundLocationGranted: boolean;
  cameraPermissionGranted: boolean;
  
  // Step 5: Consent
  termsAccepted: boolean;
  privacyAccepted: boolean;
  backgroundTrackingConsent: boolean;
  
  // Progress tracking
  currentStep: number;
  completedSteps: number[];
}

const STORAGE_KEY = 'driver_signup_data';

export class SignupStorage {
  static save(data: Partial<SignupData>): void {
    const existing = this.load();
    const updated = { ...existing, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  static load(): SignupData {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return this.getDefaultData();
    
    try {
      return { ...this.getDefaultData(), ...JSON.parse(stored) };
    } catch {
      return this.getDefaultData();
    }
  }

  static clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  static markStepComplete(step: number): void {
    const data = this.load();
    if (!data.completedSteps.includes(step)) {
      data.completedSteps.push(step);
      data.completedSteps.sort();
    }
    this.save(data);
  }

  static isStepComplete(step: number): boolean {
    const data = this.load();
    return data.completedSteps.includes(step);
  }

  private static getDefaultData(): SignupData {
    return {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      licenseNumber: '',
      licenseExpiry: '',
      towTruckType: '',
      vehicleRegistration: '',
      driverLicenseFront: null,
      driverLicenseBack: null,
      vehicleRegistrationDoc: null,
      profilePhoto: null,
      locationPermissionGranted: false,
      backgroundLocationGranted: false,
      cameraPermissionGranted: false,
      termsAccepted: false,
      privacyAccepted: false,
      backgroundTrackingConsent: false,
      currentStep: 1,
      completedSteps: []
    };
  }
}