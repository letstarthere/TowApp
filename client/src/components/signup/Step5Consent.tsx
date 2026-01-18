import { useState } from 'react';
import { Shield, FileText, MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface Step5Props {
  data: {
    termsAccepted: boolean;
    privacyAccepted: boolean;
    backgroundTrackingConsent: boolean;
  };
  onUpdate: (data: any) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export default function Step5Consent({ data, onUpdate, onSubmit, onBack }: Step5Props) {
  const [, setLocation] = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const allConsentsGiven = data.termsAccepted && data.privacyAccepted && data.backgroundTrackingConsent;

  const handleSubmit = async () => {
    if (!allConsentsGiven) return;
    
    setSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Terms & Consent</h2>
        <p className="text-gray-400">Final step - please review and accept our terms</p>
      </div>

      <div className="space-y-4">
        {/* Terms of Service */}
        <div className="border border-gray-600 rounded-lg p-4 bg-gray-800">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="terms"
              checked={data.termsAccepted}
              onChange={(e) => onUpdate({ termsAccepted: e.target.checked })}
              className="mt-1 w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
            />
            <div className="flex-1">
              <label htmlFor="terms" className="flex items-center space-x-2 cursor-pointer">
                <FileText className="w-5 h-5 text-orange-400" />
                <span className="font-medium text-white">Terms of Service</span>
              </label>
              <p className="text-sm text-gray-300 mt-2">
                I agree to TOWAPP's Terms of Service, including driver responsibilities, 
                service standards, and payment terms.
              </p>
              <button
                onClick={() => setLocation('/terms')}
                className="text-orange-400 hover:text-orange-300 text-sm underline mt-1"
              >
                Read full Terms of Service
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Policy */}
        <div className="border border-gray-600 rounded-lg p-4 bg-gray-800">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="privacy"
              checked={data.privacyAccepted}
              onChange={(e) => onUpdate({ privacyAccepted: e.target.checked })}
              className="mt-1 w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
            />
            <div className="flex-1">
              <label htmlFor="privacy" className="flex items-center space-x-2 cursor-pointer">
                <Shield className="w-5 h-5 text-orange-400" />
                <span className="font-medium text-white">Privacy Policy</span>
              </label>
              <p className="text-sm text-gray-300 mt-2">
                I understand how TOWAPP collects, uses, and protects my personal information 
                and location data.
              </p>
              <button
                onClick={() => setLocation('/privacy')}
                className="text-orange-400 hover:text-orange-300 text-sm underline mt-1"
              >
                Read full Privacy Policy
              </button>
            </div>
          </div>
        </div>

        {/* Background Tracking Consent */}
        <div className="border border-gray-600 rounded-lg p-4 bg-gray-800">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="tracking"
              checked={data.backgroundTrackingConsent}
              onChange={(e) => onUpdate({ backgroundTrackingConsent: e.target.checked })}
              className="mt-1 w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
            />
            <div className="flex-1">
              <label htmlFor="tracking" className="flex items-center space-x-2 cursor-pointer">
                <MapPin className="w-5 h-5 text-orange-400" />
                <span className="font-medium text-white">Background Location Tracking</span>
              </label>
              <p className="text-sm text-gray-300 mt-2">
                I explicitly consent to background location tracking while I'm available for jobs. 
                This allows me to receive tow requests even when the app is closed.
              </p>
              <div className="bg-gray-700/50 rounded p-3 mt-2">
                <p className="text-xs text-gray-400">
                  <strong>Important:</strong> You can disable this at any time in settings, 
                  but you won't receive job notifications when the app is closed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!allConsentsGiven && (
        <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-yellow-200">
              Please accept all terms and consents to complete your driver registration
            </span>
          </div>
        </div>
      )}

      <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
        <h3 className="font-medium text-blue-200 mb-2">What happens next?</h3>
        <ul className="text-sm text-blue-200 space-y-1">
          <li>• Your application will be reviewed by our team (1-3 business days)</li>
          <li>• We'll verify your documents and credentials</li>
          <li>• You'll receive an email when your account is approved</li>
          <li>• Once approved, you can start accepting tow requests</li>
        </ul>
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
          onClick={handleSubmit}
          disabled={!allConsentsGiven || submitting}
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
        >
          {submitting ? 'Submitting Application...' : 'Complete Registration'}
        </Button>
      </div>
    </div>
  );
}