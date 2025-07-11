import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, Star, Settings, FileText, DollarSign, History, HelpCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DriverProfile() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout"),
    onSuccess: () => {
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
      });
      setLocation("/");
    },
  });

  const handleBack = () => {
    setLocation("/");
  };

  const handleLogout = () => {
    logoutMutation.mutate();
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
        <h1 className="text-xl font-semibold text-towapp-black">Driver Profile</h1>
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </Button>
      </div>

      <div className="flex-1 p-6">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-towapp-orange rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "D"}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-towapp-black">{user?.name}</h2>
          <p className="text-gray-600">{user?.driver?.companyName || "Independent Driver"}</p>
          <div className="flex items-center justify-center mt-2">
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
            <span className="text-gray-600 ml-2">4.9 rating (247 reviews)</span>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <h3 className="font-semibold text-towapp-black mb-2">Driver Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name</span>
                  <span className="font-medium">{user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Company</span>
                  <span className="font-medium">{user?.driver?.companyName || "Independent"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vehicle</span>
                  <span className="font-medium">{user?.driver?.vehicleType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">License</span>
                  <span className="font-medium">{user?.driver?.licensePlate}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <h3 className="font-semibold text-towapp-black mb-2">This Week's Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-towapp-black">43</p>
                  <p className="text-sm text-gray-600">Completed Jobs</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-towapp-black">R18,750</p>
                  <p className="text-sm text-gray-600">Total Earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-between p-4 h-auto"
            >
              <div className="flex items-center">
                <FileText className="w-5 h-5 mr-3 text-gray-600" />
                <span>Vehicle Documents</span>
              </div>
              <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between p-4 h-auto"
            >
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 mr-3 text-gray-600" />
                <span>Earnings History</span>
              </div>
              <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between p-4 h-auto"
            >
              <div className="flex items-center">
                <History className="w-5 h-5 mr-3 text-gray-600" />
                <span>Job History</span>
              </div>
              <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between p-4 h-auto"
            >
              <div className="flex items-center">
                <HelpCircle className="w-5 h-5 mr-3 text-gray-600" />
                <span>Support</span>
              </div>
              <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
            </Button>
          </div>

          <div className="flex space-x-3 mt-8">
            <Button
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-medium"
            >
              Go Offline
            </Button>
            <Button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-medium"
            >
              {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
