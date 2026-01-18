import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, X } from "lucide-react";
import type { MockDriver } from "@/lib/types";

interface RequestModalProps {
  driver: MockDriver;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function RequestModal({ driver, onConfirm, onCancel, isLoading }: RequestModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50" onClick={onCancel}>
      <Card className="w-full max-w-md rounded-t-3xl" onClick={(e) => e.stopPropagation()}>
        <CardContent className="p-6">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6 cursor-pointer" onClick={onCancel}></div>
          
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
                <p className="font-semibold text-black">
                  {driver.name}
                </p>
                <p className="text-sm text-gray-600">
                  {driver.rating} ★ • {driver.eta}
                </p>
              </div>
            </div>
            
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Distance</span>
                    <span className="text-sm font-medium text-black">2.5 km</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Booking Fee (%)</span>
                    <span className="text-sm font-medium text-black">15%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Cancellation Fee</span>
                    <span className="text-sm font-medium text-black">R50</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Payment:</span>
                      <span className="text-2xl font-bold text-black">R350</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Final price may vary based on distance and services
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 px-6 rounded-xl font-semibold text-lg"
          >
            {isLoading ? "Sending..." : "Confirm Request"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
