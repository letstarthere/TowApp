import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { User, Truck } from "lucide-react";
import { useEffect, useState } from "react";

export default function RoleSelection() {
  const [, setLocation] = useLocation();
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setTimeout(() => setFadeIn(true), 100);
  }, []);

  const handleUserSelect = () => {
    setLocation("/user-auth");
  };

  const handleDriverSelect = () => {
    setLocation("/driver-auth");
  };

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col transition-opacity duration-700 ease-in-out ${
      fadeIn ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-12">
        <div className="max-w-sm mx-auto w-full">
          {/* Title Section */}
          <div className="text-center mb-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Welcome to TOWAPP
            </h1>
            <p className="text-base text-gray-600">
              Choose how you'd like to get started
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-4">
            <Button
              onClick={handleUserSelect}
              className="w-full h-16 bg-towapp-orange hover:bg-orange-600 text-white rounded-xl font-semibold text-lg shadow-sm"
            >
              <User className="w-5 h-5 mr-3" />
              I Need A Tow
            </Button>

            <Button
              onClick={handleDriverSelect}
              variant="outline"
              className="w-full h-16 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold text-lg"
            >
              <Truck className="w-5 h-5 mr-3" />
              I'm A Driver
            </Button>
          </div>

          {/* Supporting Text */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Secure and reliable towing services
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
