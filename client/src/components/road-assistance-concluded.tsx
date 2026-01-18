import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Download, Eye, CheckCircle, Camera, FileText, Check } from "lucide-react";
import logoPath from "@assets/blackapplogo.png";
import driverProfileImage from "../../../attached_assets/driver_profile_image.png";
import towTruckImage from "../../../attached_assets/white-long-flatbed-tow-truck.svg";

interface RoadAssistanceConcludedProps {
  driver: {
    id: number;
    name: string;
    vehicleType: string;
    licensePlate: string;
    rating: number;
    phone: string;
    type?: 'standard' | 'premium';
    premiumProvider?: string;
  };
  serviceDetails: {
    pickupLocation: string;
    dropoffLocation: string;
    distance: string;
    totalCost: number;
    bookingFee: number;
    cancellationFee: number;
    serviceDate: string;
    serviceTime: string;
  };
  onComplete: () => void;
}

export default function RoadAssistanceConcluded({ 
  driver, 
  serviceDetails, 
  onComplete 
}: RoadAssistanceConcludedProps) {
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceDownloaded, setInvoiceDownloaded] = useState(false);

  const getBrandColors = (provider?: string) => {
    switch (provider) {
      case 'Outsurance':
        return 'bg-green-600 text-white border-green-600';
      case 'FirstHelp':
        return 'bg-gradient-to-r from-black to-red-600 text-white border-red-600';
      case 'MiWay':
        return 'bg-pink-500 text-white border-pink-500';
      default:
        return 'bg-orange-500 text-white border-orange-500';
    }
  };

  const handleRatingClick = (value: number) => {
    setRating(value);
  };

  const handleDownloadInvoice = () => {
    // Generate and download invoice
    window.print();
    setInvoiceDownloaded(true);
    setShowInvoice(false);
  };

  const mockUserPhotos = [
    "/api/placeholder/300/200", // Front
    "/api/placeholder/300/200", // Back  
    "/api/placeholder/300/200", // Left
    "/api/placeholder/300/200"  // Right
  ];

  const mockDriverPhotos = [
    "/api/placeholder/300/200", // Loading
    "/api/placeholder/300/200", // Secured
    "/api/placeholder/300/200", // Unloading
    "/api/placeholder/300/200"  // Final
  ];

  if (showInvoice) {
    return (
      <div className="min-h-screen bg-white p-6">
        {/* Invoice Header */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <img src={logoPath} alt="TOWAPP" className="h-12" />
            <Button
              variant="ghost"
              onClick={() => setShowInvoice(false)}
              className="text-gray-600"
            >
              ← Back
            </Button>
          </div>

          {/* Invoice Content */}
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">ROAD ASSISTANCE INVOICE</h1>
              <p className="text-gray-600">Invoice #TA-{Date.now().toString().slice(-6)}</p>
            </div>

            {/* Service Provider */}
            {driver.type === 'premium' && driver.premiumProvider && (
              <Card className={`${getBrandColors(driver.premiumProvider)} mb-6`}>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-2">{driver.premiumProvider}</h2>
                  <p className="opacity-90">Premium Road Assistance Service</p>
                </CardContent>
              </Card>
            )}

            {/* Service Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-lg mb-4">Service Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Date:</span> {serviceDetails.serviceDate}</p>
                  <p><span className="font-medium">Time:</span> {serviceDetails.serviceTime}</p>
                  <p><span className="font-medium">Driver:</span> {driver.name}</p>
                  <p><span className="font-medium">Vehicle:</span> {driver.vehicleType}</p>
                  <p><span className="font-medium">License:</span> {driver.licensePlate}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-lg mb-4">Route Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">From:</span> {serviceDetails.pickupLocation}</p>
                  <p><span className="font-medium">To:</span> {serviceDetails.dropoffLocation}</p>
                  <p><span className="font-medium">Distance:</span> {serviceDetails.distance}</p>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div>
              <h3 className="font-bold text-lg mb-4">Cost Breakdown</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Base Service Fee</span>
                  <span>R{serviceDetails.totalCost - serviceDetails.bookingFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>Booking Fee (15%)</span>
                  <span>R{serviceDetails.bookingFee}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total Amount</span>
                  <span>R{serviceDetails.totalCost}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-600 border-t pt-6">
              <p>Thank you for using TOWAPP Road Assistance Services</p>
              <p>For support, contact us at support@towapp.com</p>
            </div>
          </div>

          {/* Download Button */}
          <div className="mt-8 text-center">
            <Button
              onClick={handleDownloadInvoice}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Road Assistance Concluded
          </h1>
          <p className="text-sm text-gray-600">
            The driver has securely onloaded and offloaded your car
          </p>
        </div>

        {/* Driver Info Card - using driver-on-way format */}
        <div className="mb-6">
          <div className="flex items-start space-x-6 p-4 bg-gray-50 rounded-lg">
            {/* Driver profile image */}
            <div className="flex flex-col items-center">
              <img 
                src={driverProfileImage} 
                alt="Driver Profile" 
                className="w-16 h-16 rounded-full object-cover mb-1"
              />
              <div className="flex items-center justify-center px-2 py-1 bg-white border border-black rounded-full">
                <Star className="w-3 h-3 text-orange-500 fill-current mr-1" />
                <span className="text-xs text-black font-medium">{driver.rating}</span>
              </div>
            </div>
            
            {/* Vehicle and driver info */}
            <div className="flex-1">
              <p className="text-lg font-bold text-black mb-0.5">Flatbed Truck</p>
              <p className="text-sm font-bold text-gray-500 mb-0.5">Mercedes Actros</p>
              <p className="text-sm font-medium text-gray-800 mb-0.5">{driver.licensePlate}</p>
              <p className="text-sm text-gray-600">{driver.name}</p>
              {driver.type === 'premium' && driver.premiumProvider && (
                <p className="text-sm text-blue-600 font-medium">{driver.premiumProvider}</p>
              )}
            </div>
            
            {/* Truck image */}
            <div>
              <img 
                src={towTruckImage} 
                alt="Tow Truck" 
                className="w-32 h-20 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Rating Section */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-bold mb-3">Rate Your Driver</h3>
            <div className="flex justify-center space-x-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRatingClick(star)}
                  className="p-1"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'text-orange-500 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Service Summary */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-bold mb-3">Service Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Cost:</span>
                <span className="font-medium">R{serviceDetails.totalCost}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Distance:</span>
                <span className="font-medium">{serviceDetails.distance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service Date:</span>
                <span className="font-medium">{serviceDetails.serviceDate}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Preview */}
        <div className="mb-6">
          <Button
            onClick={() => setShowInvoice(true)}
            variant="outline"
            className={`w-full py-3 ${
              invoiceDownloaded 
                ? 'border-green-500 text-green-600 hover:bg-green-50'
                : 'border-orange-500 text-orange-500 hover:bg-orange-50'
            }`}
            disabled={invoiceDownloaded}
          >
            {invoiceDownloaded ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Invoice Downloaded
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Preview Invoice
              </>
            )}
          </Button>
        </div>

        {/* Comments Section */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-bold mb-3">Any Complaints/Comments?</h3>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Share your experience or report any issues..."
              className="w-full h-24 resize-none"
            />
          </CardContent>
        </Card>

        {/* Done Button */}
        <Button
          onClick={onComplete}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 font-semibold text-lg"
        >
          Done
        </Button>
      </div>
    </div>
  );
}