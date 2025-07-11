import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import logoPath from "@assets/getstarted logo_1752240922747.png";

export default function Splash() {
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    setLocation("/role-selection");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between py-16 splash-bg relative">
      <div className="absolute inset-0 bg-black bg-opacity-70"></div>
      
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="text-center">
          <img 
            src={logoPath} 
            alt="TOWAPP Logo" 
            className="w-48 h-auto mx-auto mb-8"
          />
          <p className="text-white text-lg font-light">
            Need a tow? We're here to help.
          </p>
        </div>
      </div>
      
      <div className="relative z-10 w-full max-w-md px-6">
        <Button 
          onClick={handleGetStarted}
          className="w-full bg-towapp-orange hover:bg-orange-600 text-white py-4 px-8 rounded-xl font-semibold text-lg shadow-lg"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}
