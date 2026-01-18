import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export default function PrivacyPolicy() {
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
          <h1 className="text-xl font-bold">Privacy Policy</h1>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        <div className="prose prose-gray max-w-none">
          <p className="text-sm text-gray-500 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

          <h2>Information We Collect</h2>
          <h3>Location Data</h3>
          <p>We collect your location to:</p>
          <ul>
            <li>Match you with nearby tow truck drivers</li>
            <li>Provide accurate pickup and delivery services</li>
            <li>Track service progress in real-time</li>
          </ul>

          <h3>Camera and Photos</h3>
          <p>We access your camera to:</p>
          <ul>
            <li>Capture photos of your vehicle for driver identification</li>
            <li>Document vehicle condition before towing</li>
          </ul>

          <h3>Personal Information</h3>
          <p>We collect:</p>
          <ul>
            <li>Name, email, and phone number for account creation</li>
            <li>Vehicle information for service delivery</li>
            <li>Payment information for transaction processing</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <ul>
            <li>Provide towing and roadside assistance services</li>
            <li>Connect users with qualified drivers</li>
            <li>Process payments and maintain transaction records</li>
            <li>Send service updates and notifications</li>
            <li>Improve our services and user experience</li>
          </ul>

          <h2>Information Sharing</h2>
          <p>We share your information only:</p>
          <ul>
            <li>With drivers to fulfill your service request</li>
            <li>With payment processors for transaction handling</li>
            <li>When required by law or legal process</li>
            <li>With your explicit consent</li>
          </ul>

          <h2>Data Security</h2>
          <p>We protect your information through:</p>
          <ul>
            <li>Encryption of data in transit and at rest</li>
            <li>Secure authentication systems</li>
            <li>Regular security audits and updates</li>
            <li>Limited access to personal data</li>
          </ul>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Delete your account and data</li>
            <li>Opt out of marketing communications</li>
          </ul>

          <h2>Contact Us</h2>
          <p>For privacy questions or concerns:</p>
          <ul>
            <li>Email: privacy@towapp.co.za</li>
            <li>Phone: +27 11 123 4567</li>
          </ul>
        </div>
      </div>
    </div>
  );
}