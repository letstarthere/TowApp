import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DriverAuth() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const { toast } = useToast();

  const authMutation = useMutation({
    mutationFn: async () => {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin 
        ? { email, phone }
        : { 
            email, 
            phone, 
            name, 
            userType: "driver",
            driverData: {
              companyName,
              vehicleType,
              licensePlate
            }
          };
      
      return apiRequest("POST", endpoint, payload);
    },
    onSuccess: (data) => {
      // Invalidate auth cache to trigger user data refetch
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      toast({
        title: "Success",
        description: isLogin ? "Logged in successfully" : "Driver account created successfully",
      });
      
      // Navigate to appropriate dashboard based on user type
      setTimeout(() => {
        if (data.userType === 'driver') {
          setLocation("/driver-map");
        } else {
          setLocation("/role-selection"); // Fallback
        }
      }, 100);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    authMutation.mutate();
  };

  const handleBack = () => {
    setLocation("/role-selection");
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
        <h1 className="text-xl font-semibold text-towapp-black">Driver {isLogin ? "Login" : "Signup"}</h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <Card className="w-full max-w-sm mx-auto">
          <CardContent className="p-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-towapp-black mb-2">
                {isLogin ? "Driver Portal" : "Join as Driver"}
              </h2>
              <p className="text-gray-600">
                {isLogin ? "Access your driver dashboard" : "Create your driver account"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-towapp-orange focus:border-towapp-orange"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {!isLogin && (
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-towapp-orange focus:border-towapp-orange"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              )}

              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-towapp-orange focus:border-towapp-orange"
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              {!isLogin && (
                <>
                  <div>
                    <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">
                      Company Name (Optional)
                    </Label>
                    <Input
                      id="companyName"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-towapp-orange focus:border-towapp-orange"
                      placeholder="Enter your company name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="vehicleType" className="text-sm font-medium text-gray-700">
                      Vehicle Type
                    </Label>
                    <Input
                      id="vehicleType"
                      type="text"
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-towapp-orange focus:border-towapp-orange"
                      placeholder="e.g., Ford F-550 Tow Truck"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="licensePlate" className="text-sm font-medium text-gray-700">
                      License Plate
                    </Label>
                    <Input
                      id="licensePlate"
                      type="text"
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value)}
                      className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-towapp-orange focus:border-towapp-orange"
                      placeholder="Enter license plate"
                      required
                    />
                  </div>
                </>
              )}

              <Button
                type="submit"
                disabled={authMutation.isPending}
                className="w-full bg-towapp-orange hover:bg-orange-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg disabled:opacity-50"
              >
                {authMutation.isPending ? "Please wait..." : "Continue"}
              </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-gray-600">
                {isLogin ? "New driver?" : "Already have an account?"}{" "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-towapp-orange font-semibold hover:underline"
                >
                  {isLogin ? "Apply now" : "Sign in"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
