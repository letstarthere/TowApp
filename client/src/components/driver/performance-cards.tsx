import { DollarSign, TrendingUp, Star, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

interface PerformanceCardsProps {
  todaysEarnings: number;
  reliabilityScore: number;
  acceptanceRate: number;
}

export default function PerformanceCards({ 
  todaysEarnings, 
  reliabilityScore, 
  acceptanceRate 
}: PerformanceCardsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const cards = [
    {
      icon: DollarSign,
      title: "Today's Earnings",
      value: `R${todaysEarnings}`,
      subtitle: "vs R420 yesterday",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: TrendingUp,
      title: "Reliability Score",
      value: `${reliabilityScore}%`,
      subtitle: "Above average",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Star,
      title: "Acceptance Rate",
      value: `${acceptanceRate}%`,
      subtitle: "Last 30 days",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="absolute bottom-20 left-0 right-0 z-30">
      {/* Drag Handle */}
      <div className="flex justify-center mb-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-12 h-1 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors"
        />
      </div>

      {/* Cards Container */}
      <div className={`bg-white rounded-t-3xl shadow-2xl transition-all duration-300 ${
        isExpanded ? 'pb-6' : 'pb-2'
      }`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-gray-900">Performance</h3>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronUp className={`w-5 h-5 text-gray-600 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`} />
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-3 gap-3">
            {cards.map((card, index) => (
              <Card 
                key={index}
                className={`cursor-pointer hover:shadow-md transition-shadow ${card.bgColor} border-0`}
              >
                <CardContent className="p-3 text-center">
                  <div className={`w-8 h-8 ${card.color} mx-auto mb-2 flex items-center justify-center`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                  <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                  <p className="text-xs text-gray-600 font-medium">{card.title}</p>
                  {isExpanded && (
                    <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">This Week</p>
                  <p className="font-semibold">R2,340</p>
                </div>
                <div>
                  <p className="text-gray-600">Jobs Completed</p>
                  <p className="font-semibold">12 today</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}