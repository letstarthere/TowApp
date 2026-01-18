import { Clock, Shield, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface DriverVerificationModalProps {
  isOpen: boolean;
  driverName: string;
  email: string;
}

export default function DriverVerificationModal({ isOpen, driverName, email }: DriverVerificationModalProps) {
  const [, setLocation] = useLocation();

  if (!isOpen) return null;

  const handleContactSupport = () => {
    setLocation('/driver/support');
  };

  const handleLogout = () => {
    localStorage.clear();
    setLocation('/');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative bg-gray-800 rounded-2xl p-8 mx-4 max-w-md w-full border border-gray-700 shadow-2xl">
        <div className="text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-orange-400" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-3">
            Account Under Review
          </h2>

          {/* Message */}
          <p className="text-gray-300 mb-6 leading-relaxed">
            Hi {driverName}, your driver application is currently being reviewed by our team. 
            You'll be able to start accepting jobs once your account is approved.
          </p>

          {/* Status Info */}
          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="text-blue-300 font-medium">Verification in Progress</span>
            </div>
            <p className="text-gray-400 text-sm">
              Expected timeline: 1-3 business days
            </p>
          </div>

          {/* Contact Info */}
          <div className="text-left bg-gray-700/30 rounded-lg p-4 mb-6">
            <h3 className="text-white font-medium mb-3">We'll notify you via:</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">{email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">SMS notifications</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleContactSupport}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3"
            >
              Contact Support
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full text-gray-400 hover:text-white hover:bg-gray-700"
            >
              Sign Out
            </Button>
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-500 mt-6">
            Questions? Email drivers@towapp.co.za or call +27 11 123 4567
          </p>
        </div>
      </div>
    </div>
  );
}