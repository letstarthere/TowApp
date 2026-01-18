import { useEffect, useState } from 'react';
import { Bell, Send, MessageSquare, Mail, Smartphone, Plus } from 'lucide-react';

export default function Notifications() {
  const [templates, setTemplates] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data loading
    setTimeout(() => {
      setTemplates([
        {
          id: 1,
          name: 'Driver Verification Approved',
          type: 'push',
          audience: 'drivers',
          isActive: true
        },
        {
          id: 2,
          name: 'System Maintenance Alert',
          type: 'push',
          audience: 'all',
          isActive: true
        }
      ]);
      setBroadcasts([
        {
          id: 1,
          audience: 'all',
          status: 'sent',
          sentAt: '2024-01-15T10:00:00Z',
          deliveryStats: { sent: 1250, delivered: 1198, failed: 52 }
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
        <h1 className="text-2xl font-bold text-white">Notifications & Communications</h1>
        <div className="flex items-center space-x-4">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </button>
          <button className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
            <Send className="w-4 h-4 mr-2" />
            Send Broadcast
          </button>
        </div>
      </div>

      {/* Notification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Sent Today</p>
              <p className="text-2xl font-bold text-blue-400">1,250</p>
            </div>
            <Send className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Delivered</p>
              <p className="text-2xl font-bold text-green-400">1,198</p>
            </div>
            <Bell className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Failed</p>
              <p className="text-2xl font-bold text-red-400">52</p>
            </div>
            <MessageSquare className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Delivery Rate</p>
              <p className="text-2xl font-bold text-purple-400">95.9%</p>
            </div>
            <Bell className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Notification Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Broadcast Tools</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-400 mb-4">Send notifications to users and drivers.</p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Push notifications to mobile apps</p>
              <p>• SMS messaging for urgent alerts</p>
              <p>• Email communications</p>
              <p>• Targeted audience selection</p>
              <p>• Scheduled delivery options</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">System Alerts</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-400 mb-4">Automated system and maintenance notifications.</p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Maintenance mode announcements</p>
              <p>• Service outage notifications</p>
              <p>• Emergency system alerts</p>
              <p>• Driver verification updates</p>
              <p>• Payment and billing notices</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Templates */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Notification Templates</h2>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Create Template
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-medium">{template.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex items-center text-gray-400">
                      {template.type === 'push' && <Smartphone className="w-4 h-4" />}
                      {template.type === 'sms' && <MessageSquare className="w-4 h-4" />}
                      {template.type === 'email' && <Mail className="w-4 h-4" />}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Audience: {template.audience}</span>
                  <div className="space-x-2">
                    <button className="text-blue-400 hover:text-blue-300">Edit</button>
                    <button className="text-orange-400 hover:text-orange-300">Send</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Broadcast History */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Recent Broadcasts</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {broadcasts.map((broadcast) => (
              <div key={broadcast.id} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-white">System Maintenance Alert</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {broadcast.status.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {new Date(broadcast.sentAt).toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Audience:</span>
                    <span className="text-white ml-2">{broadcast.audience}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Sent:</span>
                    <span className="text-white ml-2">{broadcast.deliveryStats.sent}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Delivered:</span>
                    <span className="text-green-400 ml-2">{broadcast.deliveryStats.delivered}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Failed:</span>
                    <span className="text-red-400 ml-2">{broadcast.deliveryStats.failed}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}