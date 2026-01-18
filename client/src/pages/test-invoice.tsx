import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, FileText, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TestInvoice() {
  const [showInvoice, setShowInvoice] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const mockInvoiceData = {
    invoiceNumber: "INV-2024-000123",
    date: "December 23, 2024",
    customerName: "Demo User",
    customerEmail: "bampoesean@gmail.com",
    customerPhone: "+27123456789",
    driverName: "John Smith",
    companyName: "QuickTow Services",
    service: "Vehicle Towing",
    amount: "R450.00",
    pickupLocation: "123 Main Street, Hatfield, Pretoria",
    dropoffLocation: "ABC Auto Repair, Centurion",
    vehicleInfo: "Toyota Corolla - ABC123GP",
    distance: "15.2 km",
    duration: "45 minutes"
  };

  const handleGenerateInvoice = async () => {
    setIsGenerating(true);
    try {
      // Simulate API call to generate invoice
      const response = await fetch('/api/test/generate-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockInvoiceData),
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setShowInvoice(true);
        toast({
          title: "Invoice Generated",
          description: "Your invoice has been generated successfully",
        });
      } else {
        throw new Error('Failed to generate invoice');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate invoice",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/test/download-invoice/${mockInvoiceData.invoiceNumber}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${mockInvoiceData.invoiceNumber}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Download Started",
          description: "Invoice PDF download has started",
        });
      } else {
        throw new Error('Failed to download invoice');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download invoice",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8">Invoice Test</h1>
        
        <Button
          onClick={handleGenerateInvoice}
          disabled={isGenerating}
          className="w-full bg-towapp-orange hover:bg-orange-600 text-white py-3 mb-4"
        >
          <FileText className="w-5 h-5 mr-2" />
          {isGenerating ? "Generating..." : "Generate Test Invoice"}
        </Button>

        {showInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md bg-white max-h-[90vh] overflow-y-auto">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Invoice Ready</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowInvoice(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Invoice #:</span>
                    <span className="font-medium">{mockInvoiceData.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{mockInvoiceData.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium">{mockInvoiceData.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Driver:</span>
                    <span className="font-medium">{mockInvoiceData.driverName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Company:</span>
                    <span className="font-medium">{mockInvoiceData.companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">{mockInvoiceData.service}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="font-medium">{mockInvoiceData.vehicleInfo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Distance:</span>
                    <span className="font-medium">{mockInvoiceData.distance}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-600 font-semibold">Total:</span>
                    <span className="font-bold text-towapp-orange">{mockInvoiceData.amount}</span>
                  </div>
                </div>

                <Button
                  onClick={handleDownload}
                  className="w-full bg-towapp-orange hover:bg-orange-600 text-white py-3"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}