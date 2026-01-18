import { ArrowLeft, MapPin, Clock, Car } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function JobHistory() {
  const [, setLocation] = useLocation();

  const jobs = [
    { id: 1, date: "2024-01-15", time: "14:30", vehicle: "Honda Civic", distance: "12km", amount: 280, status: "completed", location: "Sandton to Rosebank" },
    { id: 2, date: "2024-01-15", time: "11:15", vehicle: "Toyota Corolla", distance: "8km", amount: 220, status: "completed", location: "Midrand to Centurion" },
    { id: 3, date: "2024-01-14", time: "16:45", vehicle: "BMW 3 Series", distance: "15km", amount: 350, status: "completed", location: "Johannesburg CBD to Randburg" },
    { id: 4, date: "2024-01-14", time: "13:20", vehicle: "Ford Focus", distance: "6km", amount: 180, status: "cancelled", location: "Pretoria East" },
    { id: 5, date: "2024-01-13", time: "10:30", vehicle: "Volkswagen Polo", distance: "20km", amount: 420, status: "completed", location: "Kempton Park to OR Tambo" },
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
          <h1 className="text-xl font-bold">Job History</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {jobs.map((job) => (
          <Card key={job.id} className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <Car className="w-5 h-5 text-orange-400" />
                  <span className="font-medium text-white">{job.vehicle}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">R{job.amount}</p>
                  <p className={`text-xs ${job.status === 'completed' ? 'text-green-400' : 'text-red-400'}`}>
                    {job.status}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{job.date} at {job.time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location} • {job.distance}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}