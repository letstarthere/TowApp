import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export default function TermsOfService() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-white border-b p-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation(-1)}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold">Terms of Service</h1>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        <div className="prose prose-gray max-w-none">
          <p className="text-sm text-gray-500 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

          <h2>Acceptance of Terms</h2>
          <p>By using TOWAPP, you agree to these Terms of Service. If you disagree with any part, you may not use our service.</p>

          <h2>Service Description</h2>
          <p>TOWAPP connects users needing towing services with qualified tow truck drivers. We facilitate the connection but do not provide towing services directly.</p>

          <h2>User Responsibilities</h2>
          <h3>For Service Users:</h3>
          <ul>
            <li>Provide accurate vehicle and location information</li>
            <li>Be present at pickup location at agreed time</li>
            <li>Pay agreed fees for services rendered</li>
            <li>Treat drivers with respect and courtesy</li>
          </ul>

          <h3>For Drivers:</h3>
          <ul>
            <li>Maintain valid licenses and insurance</li>
            <li>Provide safe and professional service</li>
            <li>Arrive at scheduled times</li>
            <li>Handle vehicles with care</li>
          </ul>

          <h2>Cancellation Policy</h2>
          <ul>
            <li>Users may cancel within 5 minutes of request without charge</li>
            <li>Cancellations after driver dispatch may incur fees</li>
            <li>Drivers may cancel for safety or legal reasons</li>
            <li>No-show fees may apply for missed appointments</li>
          </ul>

          <h2>Payment Terms</h2>
          <ul>
            <li>Prices are estimates and may vary based on actual service</li>
            <li>Payment is due upon service completion</li>
            <li>Disputes must be reported within 24 hours</li>
            <li>Refunds are processed according to our refund policy</li>
          </ul>

          <h2>Liability and Insurance</h2>
          <ul>
            <li>Drivers maintain their own insurance coverage</li>
            <li>TOWAPP is not liable for vehicle damage during towing</li>
            <li>Users should verify driver credentials before service</li>
            <li>Report any incidents immediately through the app</li>
          </ul>

          <h2>Prohibited Uses</h2>
          <p>You may not:</p>
          <ul>
            <li>Use the service for illegal activities</li>
            <li>Harass or discriminate against other users</li>
            <li>Attempt to circumvent payment systems</li>
            <li>Reverse engineer or hack the application</li>
          </ul>

          <h2>Account Termination</h2>
          <p>We may suspend or terminate accounts for:</p>
          <ul>
            <li>Violation of these terms</li>
            <li>Fraudulent activity</li>
            <li>Safety concerns</li>
            <li>Non-payment of fees</li>
          </ul>

          <h2>Contact Information</h2>
          <p>For questions about these terms:</p>
          <ul>
            <li>Email: legal@towapp.co.za</li>
            <li>Phone: +27 11 123 4567</li>
          </ul>
        </div>
      </div>
    </div>
  );
}