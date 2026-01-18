import { useEffect, useState } from 'react';
import { MapPin, Truck, Users, AlertCircle, Wifi, WifiOff, CheckCircle, Clock } from 'lucide-react';

interface LiveJob {
  id: number;
  status: string;
  pickupAddress: string;
  driver: { name: string; location: { lat: number; lng: number } };
  user: { name: string; location: { lat: number; lng: number } };
  estimatedCompletion: string;
  priority: 'normal' | 'high' | 'urgent';
}

interface SystemHealth {
  apiUptime: number;
  websocketStatus: 'connected' | 'disconnected' | 'degraded';
  notificationDelivery: number;
  activeConnections: number;
  errorRate: number;
  responseTime: number;
}

export default function LiveOperations() {
  const [liveJobs, setLiveJobs] = useState<LiveJob[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [counters, setCounters] = useState({
    activeJobs: 0,
    unassignedJobs: 0,
    stuckJobs: 0,
    activeDrivers: 0,
    onlineUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchLiveData = async () => {
    try {
      // Mock live data - replace with actual API calls
      const mockLiveJobs: LiveJob[] = [
        {
          id: 1,
          status: 'in_progress',
          pickupAddress: '123 Main St, Cape Town',
          driver: { name: 'Mike Johnson', location: { lat: -33.9249, lng: 18.4241 } },
          user: { name: 'John Smith', location: { lat: -33.9249, lng: 18.4241 } },
          estimatedCompletion: '2024-01-15T11:30:00Z',
          priority: 'normal'
        },
        {
          id: 2,
          status: 'en_route',
          pickupAddress: '456 Oak Ave, Cape Town',
          driver: { name: 'Sarah Wilson', location: { lat: -33.9350, lng: 18.4350 } },
          user: { name: 'Alice Brown', location: { lat: -33.9400, lng: 18.4400 } },
          estimatedCompletion: '2024-01-15T11:45:00Z',
          priority: 'high'
        },
        {
          id: 3,
          status: 'accepted',
          pickupAddress: '789 Pine St, Cape Town',
          driver: { name: 'David Brown', location: { lat: -33.9150, lng: 18.4150 } },
          user: { name: 'Emma Davis', location: { lat: -33.9200, lng: 18.4200 } },
          estimatedCompletion: '2024-01-15T12:00:00Z',
          priority: 'urgent'
        }
      ];

      const mockSystemHealth: SystemHealth = {
        apiUptime: 99.8,
        websocketStatus: 'connected',
        notificationDelivery: 95.9,
        activeConnections: 1247,
        errorRate: 0.2,
        responseTime: 145
      };

      const mockCounters = {
        activeJobs: 6,
        unassignedJobs: 2,
        stuckJobs: 1,
        activeDrivers: 45,
        onlineUsers: 1247
      };

      setLiveJobs(mockLiveJobs);
      setSystemHealth(mockSystemHealth);
      setCounters(mockCounters);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch live data:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'assigned': return 'text-blue-400';
      case 'accepted': return 'text-green-400';
      case 'en_route': return 'text-purple-400';
      case 'in_progress': return 'text-orange-400';
      case 'completed': return 'text-green-500';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

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
        <h1 className="text-2xl font-bold text-white">Live Operations Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live - Updates every 5s</span>
        </div>
      </div>

      {/* Real-time Counters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Jobs</p>
              <p className="text-2xl font-bold text-white">{counters.activeJobs}</p>
            </div>
            <Truck className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Unassigned</p>
              <p className="text-2xl font-bold text-yellow-400">{counters.unassignedJobs}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Stuck Jobs</p>
              <p className="text-2xl font-bold text-red-400">{counters.stuckJobs}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Drivers</p>
              <p className="text-2xl font-bold text-green-400">{counters.activeDrivers}</p>
            </div>
            <Users className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Online Users</p>
              <p className="text-2xl font-bold text-purple-400">{counters.onlineUsers}</p>
            </div>
            <Users className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* System Health */}
      {systemHealth && (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">System Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">API Uptime</span>
                <span className="text-green-400 font-semibold">{systemHealth.apiUptime}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">WebSocket Status</span>
                <div className="flex items-center space-x-2">
                  {systemHealth.websocketStatus === 'connected' ? (
                    <Wifi className="w-4 h-4 text-green-400" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-400" />
                  )}
                  <span className={systemHealth.websocketStatus === 'connected' ? 'text-green-400' : 'text-red-400'}>
                    {systemHealth.websocketStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Notification Delivery</span>
                <span className="text-green-400 font-semibold">{systemHealth.notificationDelivery}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Active Connections</span>
                <span className="text-white font-semibold">{systemHealth.activeConnections.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Error Rate</span>
                <span className={systemHealth.errorRate < 1 ? 'text-green-400' : 'text-red-400'}>
                  {systemHealth.errorRate}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Response Time</span>
                <span className={systemHealth.responseTime < 200 ? 'text-green-400' : 'text-yellow-400'}>
                  {systemHealth.responseTime}ms
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Jobs Map Placeholder */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-4">Live Map</h2>
        <div className="bg-gray-700 h-64 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-400">
            <MapPin className="w-12 h-12 mx-auto mb-2" />
            <p>Interactive map showing:</p>
            <p className="text-sm">• Active tow jobs • Driver locations • User locations</p>
            <p className="text-xs mt-2 text-gray-500">Map integration would be implemented here</p>
          </div>
        </div>
      </div>

      {/* Live Jobs List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Active Jobs</h2>
        </div>
        <div className="divide-y divide-gray-700">
          {liveJobs.map((job) => (
            <div key={job.id} className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-white font-semibold">Job #{job.id}</span>
                  <span className={`text-sm font-medium ${getStatusColor(job.status)}`}>
                    {job.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(job.priority)}`}></div>
                </div>
                <span className="text-sm text-gray-400">
                  ETA: {new Date(job.estimatedCompletion).toLocaleTimeString()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Pickup Location</p>
                  <p className="text-white">{job.pickupAddress}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Driver</p>
                  <p className="text-white">{job.driver.name}</p>
                  <p className="text-xs text-gray-500">
                    {job.driver.location.lat.toFixed(4)}, {job.driver.location.lng.toFixed(4)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">User</p>
                  <p className="text-white">{job.user.name}</p>
                  <p className="text-xs text-gray-500">
                    {job.user.location.lat.toFixed(4)}, {job.user.location.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}