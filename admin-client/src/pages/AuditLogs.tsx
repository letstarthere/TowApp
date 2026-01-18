import { useEffect, useState } from 'react';
import { Search, Filter, Download, Eye, Shield, AlertTriangle } from 'lucide-react';

export default function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    // Mock data loading
    setTimeout(() => {
      setAuditLogs([
        {
          id: 1,
          adminId: 1,
          adminName: 'Super Admin',
          action: 'driver_approve',
          targetType: 'driver',
          targetId: 201,
          details: 'Approved driver application - all documents verified',
          ipAddress: '192.168.1.100',
          timestamp: '2024-01-15T10:30:00Z',
          sensitive: false
        },
        {
          id: 2,
          adminId: 1,
          adminName: 'Super Admin',
          action: 'payout_adjustment',
          targetType: 'driver',
          targetId: 202,
          details: 'Adjusted payout by -R50 due to dispute resolution',
          ipAddress: '192.168.1.100',
          timestamp: '2024-01-15T14:45:00Z',
          sensitive: true
        },
        {
          id: 3,
          adminId: 2,
          adminName: 'Operations Admin',
          action: 'job_reassign',
          targetType: 'job',
          targetId: 456,
          details: 'Reassigned job from driver 201 to driver 203 - original driver unavailable',
          ipAddress: '192.168.1.101',
          timestamp: '2024-01-15T16:20:00Z',
          sensitive: false
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleExportLogs = async () => {
    try {
      console.log('Exporting audit logs...');
      // Mock export functionality
      const csvContent = auditLogs.map(log => 
        `${log.timestamp},${log.adminName},${log.action},${log.targetType},${log.targetId},"${log.details}",${log.ipAddress},${log.sensitive}`
      ).join('\n');
      
      const header = 'Timestamp,Admin,Action,Target Type,Target ID,Details,IP Address,Sensitive\n';
      const csv = header + csvContent;
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export audit logs:', error);
      alert('Failed to export audit logs');
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('approve') || action.includes('verify')) return <Shield className="w-4 h-4 text-green-400" />;
    if (action.includes('suspend') || action.includes('ban')) return <AlertTriangle className="w-4 h-4 text-red-400" />;
    if (action.includes('adjust') || action.includes('refund')) return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    return <Eye className="w-4 h-4 text-blue-400" />;
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action.includes(actionFilter);
    
    return matchesSearch && matchesAction;
  });

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
        <h1 className="text-2xl font-bold text-white">Audit Logs & Compliance</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
            />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
          >
            <option value="all">All Actions</option>
            <option value="approve">Approvals</option>
            <option value="suspend">Suspensions</option>
            <option value="adjust">Adjustments</option>
            <option value="reassign">Reassignments</option>
          </select>
          <button 
            onClick={handleExportLogs}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Audit Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Actions</p>
              <p className="text-2xl font-bold text-blue-400">{auditLogs.length}</p>
            </div>
            <Eye className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Sensitive Actions</p>
              <p className="text-2xl font-bold text-red-400">
                {auditLogs.filter(log => log.sensitive).length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Unique Admins</p>
              <p className="text-2xl font-bold text-green-400">
                {new Set(auditLogs.map(log => log.adminId)).size}
              </p>
            </div>
            <Shield className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Today's Actions</p>
              <p className="text-2xl font-bold text-purple-400">
                {auditLogs.filter(log => 
                  new Date(log.timestamp).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
            <Eye className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Sensitive
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-white">{log.adminName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getActionIcon(log.action)}
                      <span className="ml-2 text-white">{log.action.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-blue-400">{log.targetType} #{log.targetId}</span>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <span className="text-gray-300 text-sm truncate block">{log.details}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">
                    {log.ipAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.sensitive ? (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        SENSITIVE
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                        STANDARD
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Information */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Compliance & Legal Protection</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="text-white font-medium mb-2">Audit Trail Features</h4>
              <ul className="space-y-1 text-gray-400">
                <li>• Immutable action logging</li>
                <li>• Timestamped entries</li>
                <li>• IP address tracking</li>
                <li>• User agent recording</li>
                <li>• Sensitive action flagging</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Data Retention</h4>
              <ul className="space-y-1 text-gray-400">
                <li>• 7-year log retention</li>
                <li>• Encrypted storage</li>
                <li>• Backup redundancy</li>
                <li>• Export capabilities</li>
                <li>• Legal compliance ready</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Security & Access</h4>
              <ul className="space-y-1 text-gray-400">
                <li>• Role-based log access</li>
                <li>• Tamper-proof records</li>
                <li>• Real-time monitoring</li>
                <li>• Anomaly detection</li>
                <li>• Compliance reporting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}