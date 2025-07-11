import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, X } from "lucide-react";
import type { DriverWithUser } from "@/lib/types";

interface RequestModalProps {
  driver: DriverWithUser;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function RequestModal({ driver, onConfirm, onCancel, isLoading }: RequestModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <Card className="w-full max-w-md rounded-t-3xl">
        <CardContent className="p-6">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
          
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-towapp-black">Confirm Request</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="w-8 h-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-towapp-orange rounded-full flex items-center justify-center text-white">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-towapp-black">
                  {driver.companyName || driver.user.name}
                </p>
                <p className="text-sm text-gray-600">
                  {driver.rating || "4.8"} ★ • 3 min away
                </p>
              </div>
            </div>
            
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Estimated Fee</span>
                  <span className="text-2xl font-bold text-towapp-black">R350</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Final price may vary based on distance and services
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex space-x-3">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 py-3 px-4 rounded-xl font-medium"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 bg-towapp-orange hover:bg-orange-600 text-white py-3 px-4 rounded-xl font-medium"
            >
              {isLoading ? "Sending..." : "Confirm Request"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
