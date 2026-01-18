import { useEffect, useState } from 'react';
import { Search, Shield, MapPin, Star, Clock, AlertTriangle } from 'lucide-react';

export default function DriverManagement() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data loading
    setTimeout(() => {
      setDrivers([
        {
          id: 201,
          name: 'Mike Johnson',
          email: 'mike@towapp.co.za',
          phone: '+27987654321',
          status: 'active',
          reliabilityScore: 4.8,
          acceptanceRate: 95.2,
          totalJobs: 156,
          earnings: 125000,
          lastLocation: { lat: -33.9249, lng: 18.4241 }
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
        <h1 className="text-2xl font-bold text-white">Driver Management</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search drivers..."
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Driver Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Drivers</p>
              <p className="text-2xl font-bold text-green-400">45</p>
            </div>
            <Shield className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Suspended</p>
              <p className="text-2xl font-bold text-red-400">3</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Online Now</p>
              <p className="text-2xl font-bold text-blue-400">28</p>
            </div>
            <MapPin className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg Rating</p>
              <p className="text-2xl font-bold text-yellow-400">4.7</p>
            </div>
            <Star className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">All Drivers</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-400">Driver management interface with verification, suspension, and performance tracking capabilities.</p>
          <div className="mt-4 space-y-2 text-sm text-gray-500">
            <p>• View driver verification status and documents</p>
            <p>• Suspend/reinstate drivers with reason codes</p>
            <p>• Force drivers offline for maintenance</p>
            <p>• View performance metrics and ratings</p>
            <p>• Track last known locations (read-only)</p>
          </div>
        </div>
      </div>
    </div>
  );
}