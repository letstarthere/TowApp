import { X } from "lucide-react";
import blackAppLogo from "../../../attached_assets/blackapplogo.png";
import roadsideAssistance from "../../../attached_assets/roadside-assistance.png";

interface WelcomePopupProps {
  onClose: () => void;
}

export default function WelcomePopup({ onClose }: WelcomePopupProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="flex flex-col items-center mb-6">
          <img src={blackAppLogo} alt="TowTech Logo" className="w-24 h-24 mb-4" />
          <h1 className="text-2xl font-bold text-center">
            Welcome to South Africa's Number 1 Roadside Assistance App
          </h1>
        </div>
        
        <div className="flex gap-6">
          <div className="flex-1">
            <h3 className="font-semibold mb-3">Our Services:</h3>
            <ul className="space-y-2 text-sm">
              <li>• Towing Service</li>
              <li>• Flat Tire Assistance</li>
              <li>• Battery Jump Start</li>
              <li>• Fuel Delivery</li>
              <li>• Pickup & Delivery</li>
              <li>• Scheduled Services</li>
            </ul>
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <img src={roadsideAssistance} alt="Roadside Assistance" className="w-full h-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
