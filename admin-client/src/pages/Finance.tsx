import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, CreditCard, Download, RefreshCw } from 'lucide-react';

export default function Finance() {
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data loading
    setTimeout(() => {
      setFinancialData({
        totalRevenue: 2450000, // R24,500 in cents
        driverPayouts: 1960000, // R19,600 in cents
        platformFee: 490000,   // R4,900 in cents
        pendingPayouts: 125000, // R1,250 in cents
        refundsIssued: 35000   // R350 in cents
      });
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
        <h1 className="text-2xl font-bold text-white">Finance & Earnings</h1>
        <div className="flex items-center space-x-4">
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Process Payouts
          </button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-green-400">R24,500</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Driver Payouts</p>
              <p className="text-2xl font-bold text-blue-400">R19,600</p>
            </div>
            <CreditCard className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Platform Fee</p>
              <p className="text-2xl font-bold text-purple-400">R4,900</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pending Payouts</p>
              <p className="text-2xl font-bold text-yellow-400">R1,250</p>
            </div>
            <RefreshCw className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Refunds Issued</p>
              <p className="text-2xl font-bold text-red-400">R350</p>
            </div>
            <DollarSign className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Financial Management Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Driver Payouts</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-400 mb-4">Manage driver earnings and payout processing.</p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• View pending and processed payouts</p>
              <p>• Manual payout adjustments with reason codes</p>
              <p>• Bulk payout processing</p>
              <p>• Driver earnings analytics</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Refund Processing</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-400 mb-4">Handle user refunds and dispute resolutions.</p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Process full and partial refunds</p>
              <p>• Refund history and tracking</p>
              <p>• Automated refund rules</p>
              <p>• Integration with payment providers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Reports */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Financial Reports & Analytics</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-400 mb-4">Comprehensive financial reporting and analysis tools.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
            <div>
              <h4 className="text-white font-medium mb-2">Revenue Analytics</h4>
              <ul className="space-y-1">
                <li>• Daily/weekly/monthly revenue</li>
                <li>• Revenue growth trends</li>
                <li>• Average job value</li>
                <li>• Peak earning periods</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Payout Management</h4>
              <ul className="space-y-1">
                <li>• Driver earnings breakdown</li>
                <li>• Payout schedules and processing</li>
                <li>• Manual adjustments and bonuses</li>
                <li>• Tax reporting integration</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Export & Compliance</h4>
              <ul className="space-y-1">
                <li>• CSV/Excel report exports</li>
                <li>• Financial audit trails</li>
                <li>• Regulatory compliance reports</li>
                <li>• Automated reconciliation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}