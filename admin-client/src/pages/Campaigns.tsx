import { useEffect, useState } from 'react';
import { Plus, Zap, Target, DollarSign, Calendar, BarChart3 } from 'lucide-react';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data loading
    setTimeout(() => {
      setCampaigns([
        {
          id: 1,
          name: 'New Driver Bonus',
          type: 'driver_incentive',
          status: 'active',
          budget: 500000,
          spent: 125000,
          startDate: '2024-01-01',
          endDate: '2024-03-31'
        },
        {
          id: 2,
          name: 'Weekend Surge',
          type: 'surge_pricing',
          status: 'active',
          budget: 0,
          spent: 0,
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Campaigns & Pricing</h1>
        <div className="flex items-center space-x-4">
          <button className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Campaigns</p>
              <p className="text-2xl font-bold text-green-400">3</p>
            </div>
            <Zap className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Budget</p>
              <p className="text-2xl font-bold text-blue-400">R8,000</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Spent</p>
              <p className="text-2xl font-bold text-orange-400">R2,850</p>
            </div>
            <Target className="w-8 h-8 text-orange-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg ROI</p>
              <p className="text-2xl font-bold text-purple-400">2.1x</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Campaign Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Incentive Campaigns</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-400 mb-4">Create and manage driver and user incentive programs.</p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Driver sign-up bonuses and rewards</p>
              <p>• User first-ride discounts</p>
              <p>• Loyalty program management</p>
              <p>• Performance-based incentives</p>
              <p>• Referral reward programs</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Dynamic Pricing</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-400 mb-4">Configure surge pricing and regional rate adjustments.</p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Surge pricing rules and multipliers</p>
              <p>• Regional pricing variations</p>
              <p>• Time-based rate adjustments</p>
              <p>• Demand-based pricing algorithms</p>
              <p>• Holiday and event pricing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Rules */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Pricing Rules</h2>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Add Rule
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-medium">Cape Town CBD</h3>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Base Price:</span>
                  <span className="text-white ml-2">R50</span>
                </div>
                <div>
                  <span className="text-gray-400">Per KM:</span>
                  <span className="text-white ml-2">R15</span>
                </div>
                <div>
                  <span className="text-gray-400">Minimum:</span>
                  <span className="text-white ml-2">R80</span>
                </div>
                <div>
                  <span className="text-gray-400">Surge:</span>
                  <span className="text-white ml-2">1.0x</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-medium">Weekend Surge - All Areas</h3>
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Scheduled</span>
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Base Price:</span>
                  <span className="text-white ml-2">R50</span>
                </div>
                <div>
                  <span className="text-gray-400">Per KM:</span>
                  <span className="text-white ml-2">R15</span>
                </div>
                <div>
                  <span className="text-gray-400">Minimum:</span>
                  <span className="text-white ml-2">R80</span>
                </div>
                <div>
                  <span className="text-gray-400">Surge:</span>
                  <span className="text-orange-400 ml-2">1.5x</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}