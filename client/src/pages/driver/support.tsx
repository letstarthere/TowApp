import { ArrowLeft, Phone, MessageCircle, AlertCircle, HelpCircle, DollarSign, Briefcase, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function DriverSupport() {
  const [, setLocation] = useLocation();

  const helpCategories = [
    { icon: DollarSign, title: "Payment Issues", description: "Questions about earnings and payouts" },
    { icon: Briefcase, title: "Job Problems", description: "Issues with tow requests or customers" },
    { icon: Smartphone, title: "App Technical Issues", description: "App crashes, bugs, or errors" },
    { icon: HelpCircle, title: "General Help", description: "Other questions and support" }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/driver-map")}
            className="text-white hover:bg-gray-800"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold">Support</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Emergency Support */}
        <Card className="bg-red-900/30 border-red-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <span>Emergency Support</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              For urgent issues during a tow job or safety concerns
            </p>
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
              <Phone className="w-5 h-5 mr-2" />
              Call Emergency Support
            </Button>
          </CardContent>
        </Card>

        {/* Contact Options */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <Phone className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="font-medium text-white mb-1">Call Support</p>
              <p className="text-sm text-gray-400">Available 24/7</p>
              <Button className="w-full mt-3 bg-green-600 hover:bg-green-700">
                Call Now
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <MessageCircle className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="font-medium text-white mb-1">Chat Support</p>
              <p className="text-sm text-gray-400">Response in 5 min</p>
              <Button className="w-full mt-3 bg-blue-600 hover:bg-blue-700">
                Start Chat
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Help Categories */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Help Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {helpCategories.map((category, index) => (
              <button
                key={index}
                className="w-full flex items-center space-x-4 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left"
              >
                <category.icon className="w-6 h-6 text-orange-400" />
                <div>
                  <p className="font-medium text-white">{category.title}</p>
                  <p className="text-sm text-gray-400">{category.description}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Support Hours */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <h3 className="font-semibold text-white mb-2">Support Hours</h3>
            <div className="space-y-1 text-sm text-gray-400">
              <p>Emergency Support: 24/7</p>
              <p>General Support: Mon-Fri 8AM-8PM</p>
              <p>Chat Support: 24/7</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}