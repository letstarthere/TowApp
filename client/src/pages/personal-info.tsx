import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, User, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PersonalInfo() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout"),
    onSuccess: () => {
      localStorage.clear();
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
      });
      setLocation("/");
    },
  });

  const handleBack = () => {
    setLocation("/user-profile");
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Delete Account",
      description: "This feature will be available soon",
    });
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
        <h1 className="text-xl font-semibold text-towapp-black">Personal Information</h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 p-6">
        <div className="text-center mb-8">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
              <img 
                src="/attached_assets/user_profile_image.png" 
                alt="Profile" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = '<svg class="w-full h-full p-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>';
                  }
                }}
              />
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg hover:bg-orange-600">
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium text-towapp-black">Sean Bampoe</p>
            </div>
            <a href="#" className="text-orange-500 text-sm font-medium">Edit</a>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-towapp-black">{user?.email || "bampoesean@gmail.com"}</p>
            </div>
            <a href="#" className="text-orange-500 text-sm font-medium">Edit</a>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium text-towapp-black">{user?.phone || "+27123456789"}</p>
            </div>
            <a href="#" className="text-orange-500 text-sm font-medium">Edit</a>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-600">Home Address</p>
              <p className="font-medium text-towapp-black">123 Main St, Johannesburg</p>
            </div>
            <a href="#" className="text-orange-500 text-sm font-medium">Edit</a>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 py-3 px-4 rounded-xl font-medium"
          >
            {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
          </Button>

          <Button
            onClick={handleDeleteAccount}
            className="w-full bg-white hover:bg-red-50 text-red-600 border border-red-300 py-3 px-4 rounded-xl font-medium"
          >
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
