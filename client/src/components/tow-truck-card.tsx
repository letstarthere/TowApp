import { Button } from "@/components/ui/button";
import { Truck, Star } from "lucide-react";
import type { DriverWithUser } from "@/lib/types";

interface TowTruckCardProps {
  driver: DriverWithUser;
  onSelect: () => void;
}

export default function TowTruckCard({ driver, onSelect }: TowTruckCardProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={onSelect}>
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-towapp-orange rounded-full flex items-center justify-center text-white">
          <Truck className="w-5 h-5" />
        </div>
        <div>
          <p className="font-medium text-towapp-black">
            {driver.companyName || driver.user.name}
          </p>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm text-gray-600 ml-1">
                {driver.rating || "4.8"}
              </span>
            </div>
            <span className="text-sm text-gray-600">• 3 min away</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-towapp-black">R350</p>
        <p className="text-sm text-gray-600">Estimate</p>
      </div>
    </div>
  );
}
