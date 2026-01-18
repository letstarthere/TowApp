import { MapPin, Briefcase, DollarSign, Headphones } from "lucide-react";
import { useLocation } from "wouter";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onMenuClose?: () => void;
}

export default function BottomNavigation({ activeTab, onTabChange, onMenuClose }: BottomNavigationProps) {
  const [, setLocation] = useLocation();

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    
    // Close menu if open
    if (onMenuClose) {
      onMenuClose();
    }
    
    // Navigate based on tab
    switch (tabId) {
      case 'home':
        setLocation('/driver-map');
        break;
      case 'jobs':
        setLocation('/driver/job-history');
        break;
      case 'earnings':
        setLocation('/driver/earnings');
        break;
      case 'support':
        setLocation('/driver/support');
        break;
    }
  };
  const tabs = [
    { id: 'home', label: 'Home', icon: MapPin },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'support', label: 'Support', icon: Headphones },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`flex flex-col items-center py-2 px-4 min-w-[60px] transition-colors ${
              activeTab === tab.id
                ? 'text-orange-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className={`w-6 h-6 mb-1 ${
              activeTab === tab.id ? 'text-orange-500' : 'text-gray-500'
            }`} />
            <span className={`text-xs font-medium ${
              activeTab === tab.id ? 'text-orange-500' : 'text-gray-500'
            }`}>
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-500 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}