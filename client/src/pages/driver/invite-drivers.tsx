import { ArrowLeft, Share2, Copy, MessageCircle, Gift } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function InviteDrivers() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const referralCode = "JOHN2024";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    });
  };

  const handleShareWhatsApp = () => {
    const message = `Join TOWAPP as a driver and earn great money! Use my referral code: ${referralCode} to get R500 bonus after your first 5 completed jobs. Download: https://towapp.co.za/driver`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShareSMS = () => {
    const message = `Join TOWAPP as a driver! Use code: ${referralCode} for R500 bonus. Download: https://towapp.co.za/driver`;
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
    window.open(smsUrl);
  };

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
          <h1 className="text-xl font-bold">Invite Other Drivers</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Referral Code */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Your Referral Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg mb-4">
              <span className="text-2xl font-bold text-orange-400">{referralCode}</span>
              <Button
                onClick={handleCopyCode}
                size="sm"
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
            <p className="text-gray-400 text-sm">
              Share this code with other drivers to earn referral rewards
            </p>
          </CardContent>
        </Card>

        {/* Share Options */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Share via</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleShareWhatsApp}
              className="w-full bg-green-600 hover:bg-green-700 justify-start"
            >
              <MessageCircle className="w-5 h-5 mr-3" />
              Share on WhatsApp
            </Button>
            <Button
              onClick={handleShareSMS}
              className="w-full bg-blue-600 hover:bg-blue-700 justify-start"
            >
              <Share2 className="w-5 h-5 mr-3" />
              Share via SMS
            </Button>
          </CardContent>
        </Card>

        {/* Referral Rewards */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Gift className="w-6 h-6 text-orange-400" />
              <span>Referral Rewards</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="font-semibold text-green-400 mb-2">You Earn: R500</h3>
              <p className="text-gray-300 text-sm">
                When your referred driver completes their first 5 tow jobs
              </p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-400 mb-2">They Earn: R500</h3>
              <p className="text-gray-300 text-sm">
                New driver gets R500 bonus after completing 5 jobs
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Your Referrals */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Your Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-orange-400">3</p>
                <p className="text-sm text-gray-400">Total Invited</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">2</p>
                <p className="text-sm text-gray-400">Active Drivers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">R1,000</p>
                <p className="text-sm text-gray-400">Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}