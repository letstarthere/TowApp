import { Navigation, Filter, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingMapActionsProps {
  onRecenter: () => void;
  onFilterClick: () => void;
  onBreakMode: () => void;
  isOnBreak?: boolean;
}

export default function FloatingMapActions({ 
  onRecenter, 
  onFilterClick, 
  onBreakMode,
  isOnBreak = false 
}: FloatingMapActionsProps) {
  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col space-y-3">
      {/* Recenter Button */}
      <Button
        onClick={onRecenter}
        size="icon"
        className="w-12 h-12 rounded-full bg-white shadow-lg hover:bg-gray-50"
      >
        <Navigation className="w-6 h-6 text-gray-700" />
      </Button>

      {/* Filter Button */}
      <Button
        onClick={onFilterClick}
        size="icon"
        className="w-12 h-12 rounded-full bg-white shadow-lg hover:bg-gray-50"
      >
        <Filter className="w-6 h-6 text-gray-700" />
      </Button>

      {/* Break Mode Button */}
      <Button
        onClick={onBreakMode}
        size="icon"
        className={`w-12 h-12 rounded-full shadow-lg ${
          isOnBreak 
            ? 'bg-orange-500 hover:bg-orange-600' 
            : 'bg-white hover:bg-gray-50'
        }`}
      >
        <Coffee className={`w-6 h-6 ${isOnBreak ? 'text-white' : 'text-gray-700'}`} />
      </Button>
    </div>
  );
}