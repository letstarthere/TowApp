import { useEffect, useState } from 'react';
import { Settings, AlertTriangle, Shield, Clock, Zap, Database } from 'lucide-react';

export default function SystemConfig() {
  const [configs, setConfigs] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data loading
    setTimeout(() => {
      setConfigs([
        {
          id: 'job_timeout_pending',
          value: 300,
          description: 'Time in seconds before a pending job is marked as stuck',
          category: 'timeouts'
        },
        {
          id: 'surge_pricing_enabled',
          value: true,
          description: 'Enable dynamic surge pricing during high demand',
          category: 'features'
        },
        {
          id: 'emergency_shutdown',
          value: false,
          description: 'Emergency system shutdown - disables all new job requests',
          category: 'emergency'
        }
      ]);
      setSystemHealth({
        apiUptime: 99.8,
        websocketStatus: 'connected',
        errorRate: 0.2,
        responseTime: 145
      });
      setLoading(false);
    }, 1000);
  }, []);

  const handleConfigUpdate = async (configId: string, newValue: any) => {
    try {
      console.log(`Updating config ${configId} to:`, newValue);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setConfigs(configs.map(config => 
        config.id === configId ? { ...config, value: newValue } : config
      ));
      
      alert('Configuration updated successfully');
    } catch (error) {
      console.error('Failed to update configuration:', error);
      alert('Failed to update configuration');
    }
  };

  const handleEmergencyShutdown = async () => {
    const reason = prompt('Enter emergency shutdown reason:');
    if (!reason) return;

    try {
      console.log('EMERGENCY SHUTDOWN:', reason);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Emergency shutdown activated');
    } catch (error) {
      console.error('Failed to activate emergency shutdown:', error);
      alert('Failed to activate emergency shutdown');
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
        <h1 className="text-2xl font-bold text-white">System Configuration</h1>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleEmergencyShutdown}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Emergency Shutdown
          </button>
        </div>
      </div>

      {/* System Health Overview */}
      {systemHealth && (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">System Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <Database className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">API Uptime</p>
                <p className="text-lg font-semibold text-green-400">{systemHealth.apiUptime}%</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Zap className={`w-8 h-8 ${systemHealth.websocketStatus === 'connected' ? 'text-green-400' : 'text-red-400'}`} />
              <div>
                <p className="text-sm text-gray-400">WebSocket</p>
                <p className={`text-lg font-semibold ${systemHealth.websocketStatus === 'connected' ? 'text-green-400' : 'text-red-400'}`}>
                  {systemHealth.websocketStatus}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <AlertTriangle className={`w-8 h-8 ${systemHealth.errorRate < 1 ? 'text-green-400' : 'text-red-400'}`} />
              <div>
                <p className="text-sm text-gray-400">Error Rate</p>
                <p className={`text-lg font-semibold ${systemHealth.errorRate < 1 ? 'text-green-400' : 'text-red-400'}`}>
                  {systemHealth.errorRate}%
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className={`w-8 h-8 ${systemHealth.responseTime < 200 ? 'text-green-400' : 'text-yellow-400'}`} />
              <div>
                <p className="text-sm text-gray-400">Response Time</p>
                <p className={`text-lg font-semibold ${systemHealth.responseTime < 200 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {systemHealth.responseTime}ms
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Timeouts */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Timeout Settings
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {configs.filter(c => c.category === 'timeouts').map((config) => (
              <div key={config.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-white font-medium">{config.description}</p>
                  <p className="text-sm text-gray-400">{config.id}</p>
                </div>
                <input
                  type="number"
                  value={config.value}
                  onChange={(e) => handleConfigUpdate(config.id, parseInt(e.target.value))}
                  className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Feature Flags
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {configs.filter(c => c.category === 'features').map((config) => (
              <div key={config.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-white font-medium">{config.description}</p>
                  <p className="text-sm text-gray-400">{config.id}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.value}
                    onChange={(e) => handleConfigUpdate(config.id, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency Controls */}
      <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-lg">
        <div className="p-6 border-b border-red-700">
          <h2 className="text-lg font-semibold text-red-400 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Emergency Controls
          </h2>
        </div>
        <div className="p-6 space-y-4">
          {configs.filter(c => c.category === 'emergency').map((config) => (
            <div key={config.id} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-white font-medium">{config.description}</p>
                <p className="text-sm text-red-400">{config.id}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.value}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const confirmed = confirm('Are you sure you want to activate emergency shutdown?');
                      if (confirmed) {
                        handleConfigUpdate(config.id, true);
                      }
                    } else {
                      handleConfigUpdate(config.id, false);
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* System Information */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">System Information</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="text-white font-medium mb-2">Service Management</h4>
              <ul className="space-y-1 text-gray-400">
                <li>• Feature flag controls</li>
                <li>• Service availability toggles</li>
                <li>• Maintenance mode activation</li>
                <li>• Emergency shutdown procedures</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Performance Tuning</h4>
              <ul className="space-y-1 text-gray-400">
                <li>• Job timeout thresholds</li>
                <li>• Connection limits</li>
                <li>• Rate limiting controls</li>
                <li>• Cache configuration</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Security & Compliance</h4>
              <ul className="space-y-1 text-gray-400">
                <li>• Access control settings</li>
                <li>• Audit log retention</li>
                <li>• Data privacy controls</li>
                <li>• Encryption parameters</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}