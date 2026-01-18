import { useState } from "react";
import { X, User, DollarSign, Clock, Award, Headphones, UserPlus, Settings, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import logoPath from "@assets/getstarted logo_1752240922747.png";

interface DriverMenuProps {
  isOpen: boolean;
  onClose: () => void;
  driverName: string;
  reliabilityScore: number;
  acceptanceRate: number;
}

export default function DriverMenu({ 
  isOpen, 
  onClose, 
  driverName, 
  reliabilityScore, 
  acceptanceRate 
}: DriverMenuProps) {
  const [, setLocation] = useLocation();

  const handleNavigation = (path: string) => {
    onClose();
    setLocation(path);
  };

  const handleDriverPortal = () => {
    window.open('https://modernedgetech.co.za', '_blank');
  };

  const menuItems = [
    { icon: DollarSign, label: "Earnings", action: () => handleNavigation("/driver/earnings") },
    { icon: Clock, label: "Job History", action: () => handleNavigation("/driver/job-history") },
    { icon: Award, label: "Active Campaigns", action: () => handleNavigation("/driver/campaigns") },
    { icon: Clock, label: "Scheduled Tow Jobs", action: () => handleNavigation("/driver/scheduled-jobs") },
    { icon: Headphones, label: "Support", action: () => handleNavigation("/driver/support") },
    { icon: UserPlus, label: "Invite Other Drivers", action: () => handleNavigation("/driver/invite-drivers") },
    { icon: ExternalLink, label: "Driver Portal", action: handleDriverPortal },
    { icon: Settings, label: "Settings", action: () => handleNavigation("/driver/settings") },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div 
        className={`fixed top-0 left-0 h-full w-80 bg-gray-900 text-white z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <img 
            src={logoPath} 
            alt="TOWAPP Logo" 
            className="h-8 w-auto"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-gray-800"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Driver Profile Section */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{driverName}</h3>
              <p className="text-gray-400 text-sm">Professional Driver</p>
            </div>
          </div>
          
          {/* Performance Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-green-400">{reliabilityScore}%</p>
                <p className="text-xs text-gray-400">Reliability Score</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-blue-400">{acceptanceRate}%</p>
                <p className="text-xs text-gray-400">Acceptance Rate</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className="w-full flex items-center space-x-4 p-4 hover:bg-gray-800 transition-colors border-b border-gray-800"
            >
              <item.icon className="w-6 h-6 text-orange-400" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            TOWAPP Driver v2.1.0
          </p>
        </div>
      </div>
    </>
  );
}