import { Clock, CheckCircle, Headphones, FileText, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'wouter';
import logoPath from '@assets/getstarted logo_1752240922747.png';

export default function DriverVerificationPending() {
  const [, setLocation] = useLocation();

  const verificationSteps = [
    { icon: FileText, title: 'Document Review', description: 'Verifying your license and vehicle registration', status: 'in_progress' },
    { icon: CheckCircle, title: 'Background Check', description: 'Conducting safety and compliance verification', status: 'pending' },
    { icon: Mail, title: 'Account Approval', description: 'Final review and account activation', status: 'pending' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-700 p-4">
        <div className="max-w-2xl mx-auto text-center">
          <img src={logoPath} alt="TOWAPP" className="h-10 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Application Under Review</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 py-8">
        {/* Status Card */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-white text-xl">Verification in Progress</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-300 mb-4">
              Thank you for applying to become a TOWAPP driver. Our team is reviewing your application.
            </p>
            <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
              <p className="text-blue-200 text-sm">
                <strong>Expected Timeline:</strong> 1-3 business days
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Verification Steps */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Verification Process</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {verificationSteps.map((step, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.status === 'in_progress' 
                    ? 'bg-orange-500' 
                    : step.status === 'completed'
                      ? 'bg-green-600'
                      : 'bg-gray-600'
                }`}>
                  <step.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">{step.title}</h3>
                  <p className="text-sm text-gray-400">{step.description}</p>
                </div>
                <div className={`text-xs px-2 py-1 rounded ${
                  step.status === 'in_progress'
                    ? 'bg-orange-500/20 text-orange-300'
                    : step.status === 'completed'
                      ? 'bg-green-600/20 text-green-300'
                      : 'bg-gray-600/20 text-gray-400'
                }`}>
                  {step.status === 'in_progress' ? 'In Progress' : 
                   step.status === 'completed' ? 'Complete' : 'Pending'}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* What You Can Do */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">While You Wait</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-white font-medium">Check Your Email</p>
                  <p className="text-sm text-gray-400">We'll send updates to the email address you provided</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-white font-medium">Prepare Your Vehicle</p>
                  <p className="text-sm text-gray-400">Ensure your tow truck is in good working condition</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-white font-medium">Review Driver Guidelines</p>
                  <p className="text-sm text-gray-400">Familiarize yourself with TOWAPP's service standards</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-4">
          <Button
            onClick={() => setLocation('/driver/support')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Headphones className="w-5 h-5 mr-2" />
            Contact Support
          </Button>
          
          <Button
            onClick={() => setLocation('/role-selection')}
            variant="outline"
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Back to Home
          </Button>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400 mb-2">Questions about your application?</p>
          <p className="text-sm text-gray-300">
            Email: <span className="text-orange-400">drivers@towapp.co.za</span>
          </p>
          <p className="text-sm text-gray-300">
            Phone: <span className="text-orange-400">+27 11 123 4567</span>
          </p>
        </div>
      </div>
    </div>
  );
}