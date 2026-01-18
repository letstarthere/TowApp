import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoPath from '@assets/getstarted logo_1752240922747.png';
import ProgressIndicator from '@/components/signup/ProgressIndicator';
import Step1Account from '@/components/signup/Step1Account';
import Step2Vehicle from '@/components/signup/Step2Vehicle';
import Step3Documents from '@/components/signup/Step3Documents';
import Step4Permissions from '@/components/signup/Step4Permissions';
import Step5Consent from '@/components/signup/Step5Consent';
import { SignupStorage, SignupData } from '@/lib/signupStorage';
import { useToast } from '@/hooks/use-toast';

export default function DriverSignup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [signupData, setSignupData] = useState<SignupData>(SignupStorage.load());

  useEffect(() => {
    setCurrentStep(signupData.currentStep);
  }, []);

  const updateData = (data: Partial<SignupData>) => {
    const updated = { ...signupData, ...data };
    setSignupData(updated);
    SignupStorage.save(updated);
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    updateData({ currentStep: step });
  };

  const handleNext = () => {
    SignupStorage.markStepComplete(currentStep);
    const nextStep = currentStep + 1;
    goToStep(nextStep);
  };

  const handleBack = () => {
    const prevStep = currentStep - 1;
    if (prevStep >= 1) {
      goToStep(prevStep);
    }
  };

  const handleSubmit = async () => {
    try {
      // Save application to admin system for review
      const applicationData = {
        ...signupData,
        submittedAt: new Date().toISOString(),
        status: 'pending'
      };
      
      // Store in localStorage for admin system to access
      const existingApps = JSON.parse(localStorage.getItem('driver_applications') || '[]');
      const newApp = {
        id: Date.now(),
        ...applicationData
      };
      existingApps.push(newApp);
      localStorage.setItem('driver_applications', JSON.stringify(existingApps));
      
      // Set driver as pending verification
      localStorage.setItem('driver_verification_status', 'pending_verification');
      
      // Clear signup data
      SignupStorage.clear();
      
      // Show success and redirect
      toast({
        title: 'Application Submitted!',
        description: 'Your driver application is under review. We\'ll email you within 1-3 business days.',
      });
      
      setLocation('/driver-verification-pending');
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: 'Please try again or contact support if the problem persists.',
        variant: 'destructive',
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Account
            data={{
              fullName: signupData.fullName,
              email: signupData.email,
              phone: signupData.phone,
              password: signupData.password,
            }}
            onUpdate={updateData}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <Step2Vehicle
            data={{
              licenseNumber: signupData.licenseNumber,
              licenseExpiry: signupData.licenseExpiry,
              towTruckType: signupData.towTruckType,
              vehicleRegistration: signupData.vehicleRegistration,
            }}
            onUpdate={updateData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <Step3Documents
            data={{
              driverLicenseFront: signupData.driverLicenseFront,
              driverLicenseBack: signupData.driverLicenseBack,
              vehicleRegistrationDoc: signupData.vehicleRegistrationDoc,
              profilePhoto: signupData.profilePhoto,
            }}
            onUpdate={updateData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <Step4Permissions
            data={{
              locationPermissionGranted: signupData.locationPermissionGranted,
              backgroundLocationGranted: signupData.backgroundLocationGranted,
              cameraPermissionGranted: signupData.cameraPermissionGranted,
            }}
            onUpdate={updateData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 5:
        return (
          <Step5Consent
            data={{
              termsAccepted: signupData.termsAccepted,
              privacyAccepted: signupData.privacyAccepted,
              backgroundTrackingConsent: signupData.backgroundTrackingConsent,
            }}
            onUpdate={updateData}
            onSubmit={handleSubmit}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/role-selection')}
            className="text-white hover:bg-gray-800"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <img src={logoPath} alt="TOWAPP" className="h-8" />
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6 py-8">
        <ProgressIndicator
          currentStep={currentStep}
          completedSteps={signupData.completedSteps}
          totalSteps={5}
        />

        {renderStep()}
      </div>
    </div>
  );
}