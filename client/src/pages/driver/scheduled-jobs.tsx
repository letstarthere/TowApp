import { ArrowLeft, Calendar, MapPin, Car, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function ScheduledJobs() {
  const [, setLocation] = useLocation();

  const scheduledJobs = [
    {
      id: 1,
      date: "2024-01-16",
      time: "09:00",
      vehicle: "Mercedes C-Class",
      licensePlate: "ABC-123-GP",
      pickup: "123 Main Street, Sandton",
      customer: "John Doe",
      phone: "+27123456789",
      serviceType: "Flatbed Tow"
    },
    {
      id: 2,
      date: "2024-01-16",
      time: "14:30",
      vehicle: "Toyota Hilux",
      licensePlate: "XYZ-789-GP",
      pickup: "456 Oak Avenue, Randburg",
      customer: "Sarah Smith",
      phone: "+27987654321",
      serviceType: "Hook & Chain"
    },
    {
      id: 3,
      date: "2024-01-17",
      time: "11:15",
      vehicle: "BMW X5",
      licensePlate: "DEF-456-GP",
      pickup: "789 Pine Road, Midrand",
      customer: "Mike Johnson",
      phone: "+27555123456",
      serviceType: "Flatbed Tow"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/driver-map")}
            className="text-white hover:bg-gray-800"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold">Scheduled Jobs</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {scheduledJobs.map((job) => (
          <Card key={job.id} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-orange-400" />
                  <span>{job.date} at {job.time}</span>
                </CardTitle>
                <span className="text-sm text-green-400 bg-green-400/20 px-2 py-1 rounded">
                  {job.serviceType}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Car className="w-4 h-4 text-orange-400" />
                  <span>{job.vehicle} • {job.licensePlate}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <MapPin className="w-4 h-4 text-orange-400" />
                  <span>{job.pickup}</span>
                </div>
              </div>

              <div className="bg-gray-700 p-3 rounded-lg">
                <p className="text-white font-medium">{job.customer}</p>
                <p className="text-gray-400 text-sm">{job.phone}</p>
              </div>

              <div className="flex space-x-2">
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  Accept
                </Button>
                <Button variant="outline" className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700">
                  Reschedule
                </Button>
                <Button variant="outline" className="flex-1 border-red-600 text-red-400 hover:bg-red-600/20">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {scheduledJobs.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Scheduled Jobs</h3>
            <p className="text-gray-500">Your upcoming scheduled tows will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}