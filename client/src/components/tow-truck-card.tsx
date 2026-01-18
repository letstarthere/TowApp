import { Button } from "@/components/ui/button";
import { Truck, Star } from "lucide-react";
import type { DriverWithUser } from "@/lib/types";

interface TowTruckCardProps {
  driver: DriverWithUser;
  onSelect: () => void;
}

export default function TowTruckCard({ driver, onSelect }: TowTruckCardProps) {
  // Mock pricing and ETA based on driver name for demo
  const getPriceAndEta = (name: string) => {
    const priceMap: { [key: string]: { price: string; eta: string } } = {
      'Hatfield Haulers': { price: 'R450', eta: '3 min' },
      'Speedy Tow Pretoria': { price: 'R470', eta: '5 min' },
      'Metro Tow Services': { price: 'R500', eta: '4 min' },
      'Campus Rescue Tow': { price: 'R460', eta: '6 min' },
      '24/7 Tow Pros': { price: 'R520', eta: '2 min' }
    };
    return priceMap[name] || { price: 'R450', eta: '4 min' };
  };
  
  const { price, eta } = getPriceAndEta(driver.companyName || driver.user.name);
  
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-towapp-orange cursor-pointer transition-all" onClick={onSelect}>
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-towapp-orange rounded-full flex items-center justify-center text-white">
          <Truck className="w-6 h-6" />
        </div>
        <div>
          <p className="font-semibold text-towapp-black text-lg">
            {driver.companyName || driver.user.name}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm text-gray-600 ml-1">
                {driver.rating || "4.8"}
              </span>
            </div>
            <span className="text-sm text-gray-600">• {eta}</span>
            <span className="text-sm text-gray-600">• {driver.vehicleType}</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-towapp-black text-xl">{price}</p>
        <p className="text-sm text-gray-500">Estimate</p>
      </div>
    </div>
  );
}
