import { Shield, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopStatusBarProps {
  isAvailable: boolean;
  onToggleAvailability: () => void;
  onMenuClick: () => void;
  isLoading?: boolean;
}

export default function TopStatusBar({ 
  isAvailable, 
  onToggleAvailability, 
  onMenuClick,
  isLoading = false 
}: TopStatusBarProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/20 to-transparent">
      {/* Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </Button>

      {/* Verification Badge */}
      <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg">
        <Shield className="w-5 h-5 text-blue-600" />
        <span className="text-sm font-medium text-gray-700">TOWAPP Verified</span>
      </div>

      {/* Availability Toggle */}
      <Button
        onClick={onToggleAvailability}
        disabled={isLoading}
        className={`px-6 py-3 rounded-full shadow-lg font-bold text-base min-w-[140px] ${
          isAvailable 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          isAvailable ? 'Go Offline' : 'Go Available'
        )}
      </Button>
    </div>
  );
}