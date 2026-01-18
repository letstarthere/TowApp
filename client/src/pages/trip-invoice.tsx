import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Star } from 'lucide-react';
import { useLocation } from 'wouter';

export default function TripInvoice() {
  const [, setLocation] = useLocation();
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Mock invoice data
  const invoiceData = {
    invoiceNumber: 'INV-2024-001234',
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    user: {
      name: 'John Doe',
      phone: '+27 123 456 789',
      email: 'john@example.com'
    },
    driver: {
      name: 'Mike Johnson',
      vehicle: 'Flatbed Truck',
      license: 'TT-5678-GP'
    },
    trip: {
      pickup: '123 Oak Street, Johannesburg',
      destination: '456 Pine Avenue, Sandton',
      distance: '12.5 km',
      duration: '35 minutes',
      serviceType: 'Vehicle Towing'
    },
    pricing: {
      baseRate: 250.00,
      distanceRate: 125.00,
      total: 375.00
    }
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    
    try {
      const tripId = '123'; // TODO: Get from context
      
      const response = await fetch(`/api/requests/${tripId}/invoice`);
      if (response.ok) {
        const data = await response.json();
        
        // Open PDF in new tab
        window.open(data.invoiceUrl, '_blank');
      } else {
        alert('Failed to generate invoice');
      }
    } catch (error) {
      alert('Error generating invoice');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleProceedToRating = () => {
    setLocation('/trip-rating');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <h1 className="text-lg font-semibold">Trip Invoice</h1>
      </div>

      {/* Invoice Content */}
      <div className="flex-1 p-4">
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto">
          {/* TowApp Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-towapp-orange">TOWAPP</h2>
            <p className="text-sm text-gray-600">Professional Towing Services</p>
          </div>

          {/* Invoice Details */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Invoice #:</span>
              <span className="font-medium">{invoiceData.invoiceNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Date & Time:</span>
              <span>{invoiceData.date} {invoiceData.time}</span>
            </div>
          </div>

          {/* Customer Details */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Customer</h3>
            <div className="text-sm space-y-1">
              <p>{invoiceData.user.name}</p>
              <p className="text-gray-600">{invoiceData.user.phone}</p>
              <p className="text-gray-600">{invoiceData.user.email}</p>
            </div>
          </div>

          {/* Driver Details */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Driver</h3>
            <div className="text-sm space-y-1">
              <p>{invoiceData.driver.name}</p>
              <p className="text-gray-600">{invoiceData.driver.vehicle}</p>
              <p className="text-gray-600">License: {invoiceData.driver.license}</p>
            </div>
          </div>

          {/* Trip Details */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Trip Details</h3>
            <div className="text-sm space-y-2">
              <div>
                <span className="text-gray-600">From: </span>
                <span>{invoiceData.trip.pickup}</span>
              </div>
              <div>
                <span className="text-gray-600">To: </span>
                <span>{invoiceData.trip.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Distance:</span>
                <span>{invoiceData.trip.distance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span>{invoiceData.trip.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span>{invoiceData.trip.serviceType}</span>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="mb-6 border-t pt-4">
            <h3 className="font-semibold mb-2">Cost Breakdown</h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Base Rate:</span>
                <span>R{invoiceData.pricing.baseRate.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Distance ({invoiceData.trip.distance}):</span>
                <span>R{invoiceData.pricing.distanceRate.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base border-t pt-2">
                <span>Total:</span>
                <span>R{invoiceData.pricing.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Photos Section */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Documentation</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-100 p-2 rounded text-center">
                <FileText className="w-4 h-4 mx-auto mb-1" />
                <span>Pre-Tow Photo</span>
              </div>
              <div className="bg-gray-100 p-2 rounded text-center">
                <FileText className="w-4 h-4 mx-auto mb-1" />
                <span>Post-Tow Photo</span>
              </div>
            </div>
          </div>

          {/* Download PDF Button */}
          <Button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            variant="outline"
            className="w-full mb-4"
          >
            <Download className="w-4 h-4 mr-2" />
            {downloadingPdf ? 'Generating PDF...' : 'Download PDF Invoice'}
          </Button>

          {/* Continue Button */}
          <Button
            onClick={handleProceedToRating}
            className="w-full bg-towapp-orange hover:bg-orange-600"
          >
            <Star className="w-4 h-4 mr-2" />
            Rate Your Experience
          </Button>
        </div>
      </div>
    </div>
  );
}