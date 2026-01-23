import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, Star, CreditCard, History, HelpCircle, Car, ChevronRight, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function UserProfile() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleBack = () => {
    setLocation("/user-map");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Button>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 p-6">
        <div className="text-center mb-8">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden">
              <img 
                src="/attached_assets/user_profile_image.png" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-towapp-black">Sean Bampoe</h2>
          <div className="flex items-center justify-center mt-2">
            <Star className="w-5 h-5 text-orange-500 fill-current" />
            <span className="text-gray-600 ml-2">4.8 rating</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-between p-4 h-auto"
            onClick={() => setLocation("/personal-info")}
          >
            <div className="flex items-center">
              <User className="w-5 h-5 mr-3 text-gray-600" />
              <span>Personal Information</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Button>

          <Button
            variant="outline"
            className="w-full justify-between p-4 h-auto"
            onClick={() => setLocation("/user-vehicles")}
          >
            <div className="flex items-center">
              <Car className="w-5 h-5 mr-3 text-gray-600" />
              <span>My Vehicles</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Button>

          <Button
            variant="outline"
            className="w-full justify-between p-4 h-auto"
            onClick={() => setLocation("/payment-methods")}
          >
            <div className="flex items-center">
              <CreditCard className="w-5 h-5 mr-3 text-gray-600" />
              <span>Payment Methods</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Button>

          <Button
            variant="outline"
            className="w-full justify-between p-4 h-auto"
            onClick={() => setLocation("/trip-history")}
          >
            <div className="flex items-center">
              <History className="w-5 h-5 mr-3 text-gray-600" />
              <span>Trip History</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Button>

          <Button
            variant="outline"
            className="w-full justify-between p-4 h-auto"
          >
            <div className="flex items-center">
              <HelpCircle className="w-5 h-5 mr-3 text-gray-600" />
              <span>Help & Support</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Button>
        </div>
      </div>
    </div>
  );
}
