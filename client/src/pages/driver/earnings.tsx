import { ArrowLeft, DollarSign, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function DriverEarnings() {
  const [, setLocation] = useLocation();

  const todayJobs = [
    { id: 1, time: "14:30", vehicle: "Honda Civic", distance: "12km", amount: 280, status: "paid" },
    { id: 2, time: "11:15", vehicle: "Toyota Corolla", distance: "8km", amount: 220, status: "paid" },
    { id: 3, time: "09:45", vehicle: "BMW 3 Series", distance: "15km", amount: 350, status: "pending" },
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
          <h1 className="text-xl font-bold">Earnings</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-400">R850</p>
              <p className="text-sm text-gray-400">Today</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-400">R4,200</p>
              <p className="text-sm text-gray-400">This Week</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-400">R16,800</p>
              <p className="text-sm text-gray-400">This Month</p>
            </CardContent>
          </Card>
        </div>

        {/* Payout Status */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Payout Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Available for Payout</span>
              <span className="text-green-400 font-bold">R570</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Pending Processing</span>
              <span className="text-orange-400 font-bold">R280</span>
            </div>
          </CardContent>
        </Card>

        {/* Today's Jobs */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Today's Jobs ({todayJobs.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayJobs.map((job) => (
              <div key={job.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-white">{job.vehicle}</p>
                  <p className="text-sm text-gray-400">{job.time} • {job.distance}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">R{job.amount}</p>
                  <p className={`text-xs ${job.status === 'paid' ? 'text-green-400' : 'text-orange-400'}`}>
                    {job.status}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}