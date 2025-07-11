import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, CreditCard, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export default function PaymentMethods() {
  const [, setLocation] = useLocation();
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: "visa",
      last4: "4242",
      expiry: "12/26",
      isDefault: true
    },
    {
      id: 2,
      type: "mastercard",
      last4: "8888",
      expiry: "09/25",
      isDefault: false
    }
  ]);

  const handleBack = () => {
    setLocation("/profile");
  };

  const handleAddPayment = () => {
    // In a real app, this would open a payment form
    const newCard = {
      id: paymentMethods.length + 1,
      type: "visa",
      last4: "1234",
      expiry: "03/27",
      isDefault: false
    };
    setPaymentMethods([...paymentMethods, newCard]);
  };

  const handleRemovePayment = (id: number) => {
    setPaymentMethods(paymentMethods.filter(method => method.id !== id));
  };

  const handleSetDefault = (id: number) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
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
        <h1 className="text-xl font-semibold text-towapp-black">Payment Methods</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleAddPayment}
          className="w-10 h-10 rounded-full bg-towapp-orange hover:bg-orange-600 text-white"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 p-6">
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <Card key={method.id} className={`${method.isDefault ? 'border-towapp-orange' : 'border-gray-200'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-towapp-black">
                        {method.type === 'visa' ? 'Visa' : 'Mastercard'} ••••{method.last4}
                      </p>
                      <p className="text-sm text-gray-600">Expires {method.expiry}</p>
                      {method.isDefault && (
                        <p className="text-xs text-towapp-orange font-medium">Default</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                        className="text-xs"
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemovePayment(method.id)}
                      className="w-8 h-8 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button
          onClick={handleAddPayment}
          className="w-full mt-6 bg-towapp-orange hover:bg-orange-600 text-white py-3 px-4 rounded-xl font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Payment Method
        </Button>

        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
          <h3 className="font-semibold text-towapp-black mb-2">Security Info</h3>
          <p className="text-sm text-gray-600">
            Your payment information is securely encrypted and stored. We never store your full card number or CVV.
          </p>
        </div>
      </div>
    </div>
  );
}