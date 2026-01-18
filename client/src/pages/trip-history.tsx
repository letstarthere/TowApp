import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, MapPin, Clock, Star, Download, FileText } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function TripHistory() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [trips] = useState([
    {
      id: 1,
      date: "2024-12-15",
      time: "14:30",
      pickupAddress: "123 Main St, Johannesburg",
      dropoffAddress: "456 Oak Ave, Sandton",
      driverName: "John Smith",
      vehicleType: "Flatbed Truck",
      price: 450,
      status: "completed",
      rating: 5,
      invoiceNumber: "INV-2024-000001"
    },
    {
      id: 2,
      date: "2024-12-12",
      time: "09:15",
      pickupAddress: "789 Pine Rd, Pretoria",
      dropoffAddress: "321 Elm St, Centurion",
      driverName: "Mike Johnson",
      vehicleType: "Tow Truck",
      price: 320,
      status: "completed",
      rating: 4,
      invoiceNumber: "INV-2024-000002"
    },
    {
      id: 3,
      date: "2024-12-08",
      time: "16:45",
      pickupAddress: "555 Cedar Blvd, Randburg",
      dropoffAddress: "777 Maple Dr, Roodepoort",
      driverName: "Sarah Wilson",
      vehicleType: "Heavy Duty Truck",
      price: 680,
      status: "completed",
      rating: 5,
      invoiceNumber: "INV-2024-000003"
    },
    {
      id: 4,
      date: "2024-12-03",
      time: "11:20",
      pickupAddress: "888 Birch St, Midrand",
      dropoffAddress: "999 Willow Ave, Fourways",
      driverName: "David Brown",
      vehicleType: "Flatbed Truck",
      price: 380,
      status: "cancelled",
      rating: 0
    }
  ]);

  const handleBack = () => {
    setLocation("/profile");
  };

  const handleDownloadInvoice = async (trip: any) => {
    try {
      const response = await fetch(`/api/test/download-invoice/${trip.invoiceNumber}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${trip.invoiceNumber}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Download Started",
          description: "Invoice PDF download has started",
        });
      } else {
        throw new Error('Invoice not found');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download invoice",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Button>
        <h1 className="text-xl font-semibold text-towapp-black">Trip History</h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 p-6">
        <div className="space-y-4">
          {trips.map((trip) => (
            <Card key={trip.id} className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{trip.date} at {trip.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${getStatusColor(trip.status)}`}>
                      {getStatusText(trip.status)}
                    </span>
                    <span className="text-lg font-bold text-towapp-black">R{trip.price}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Pickup</p>
                      <p className="font-medium text-towapp-black">{trip.pickupAddress}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full mt-1 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Drop-off</p>
                      <p className="font-medium text-towapp-black">{trip.dropoffAddress}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <p className="font-medium text-towapp-black">{trip.driverName}</p>
                    <p className="text-sm text-gray-600">{trip.vehicleType}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {trip.status === 'completed' && (
                      <>
                        <div className="flex items-center space-x-1">
                          {renderStars(trip.rating)}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadInvoice(trip)}
                          className="ml-2"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Invoice
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {trips.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No trips yet</h3>
            <p className="text-gray-500">Your trip history will appear here once you book your first tow.</p>
          </div>
        )}
      </div>
    </div>
  );
}