import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, User, Truck } from "lucide-react";

export default function RoleSelection() {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    setLocation("/");
  };

  const handleUserSelect = () => {
    setLocation("/user-auth");
  };

  const handleDriverSelect = () => {
    setLocation("/driver-auth");
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
        <h1 className="text-xl font-semibold text-towapp-black">Choose Your Role</h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 space-y-6">
        <Card className="w-full max-w-sm">
          <CardContent className="p-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-towapp-black mb-2">
                Welcome to TOWAPP
              </h2>
              <p className="text-gray-600">
                How would you like to use our service?
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleUserSelect}
                className="w-full bg-towapp-orange hover:bg-orange-600 text-white py-6 px-6 rounded-xl font-semibold text-lg shadow-lg"
              >
                <User className="w-6 h-6 mr-3" />
                I Need a Tow
              </Button>

              <Button
                onClick={handleDriverSelect}
                variant="outline"
                className="w-full border-2 border-towapp-orange text-towapp-orange hover:bg-orange-50 py-6 px-6 rounded-xl font-semibold text-lg"
              >
                <Truck className="w-6 h-6 mr-3" />
                I'm a Driver
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
