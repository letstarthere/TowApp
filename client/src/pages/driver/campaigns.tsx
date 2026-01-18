import { ArrowLeft, Target, Clock, MapPin, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";

export default function ActiveCampaigns() {
  const [, setLocation] = useLocation();

  const campaigns = [
    {
      id: 1,
      title: "Daily Hustle Bonus",
      description: "Complete 5 tow jobs today and earn an extra R100",
      progress: 3,
      target: 5,
      reward: 100,
      timeLeft: "6 hours left",
      type: "daily"
    },
    {
      id: 2,
      title: "Peak Hour Champion",
      description: "Work during peak hours (7-9 AM, 5-7 PM) for 20% bonus",
      progress: 2,
      target: 4,
      reward: "20%",
      timeLeft: "Today only",
      type: "peak"
    },
    {
      id: 3,
      title: "Sandton Area Specialist",
      description: "Complete 3 jobs in Sandton area for R150 bonus",
      progress: 1,
      target: 3,
      reward: 150,
      timeLeft: "3 days left",
      type: "area"
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
          <h1 className="text-xl font-bold">Active Campaigns</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {campaign.type === 'daily' && <Target className="w-5 h-5 text-green-400" />}
                  {campaign.type === 'peak' && <Clock className="w-5 h-5 text-orange-400" />}
                  {campaign.type === 'area' && <MapPin className="w-5 h-5 text-blue-400" />}
                  <CardTitle className="text-white text-lg">{campaign.title}</CardTitle>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold">
                    {typeof campaign.reward === 'number' ? `R${campaign.reward}` : campaign.reward}
                  </p>
                  <p className="text-xs text-gray-400">{campaign.timeLeft}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">{campaign.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-white">{campaign.progress}/{campaign.target}</span>
                </div>
                <Progress 
                  value={(campaign.progress / campaign.target) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Weekly Summary */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span>This Week's Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">R1,250</p>
                <p className="text-sm text-gray-400">Bonus Earned</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">18</p>
                <p className="text-sm text-gray-400">Jobs Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}